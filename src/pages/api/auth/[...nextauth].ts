import NextAuth, { NextAuthOptions, DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import dbConnect from '@/lib/mongodb'
import mongoose from 'mongoose'

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    email: string;
    name?: string;
  }
}

// Define the user document interface
interface UserDocument {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  username?: string;
  bookmarks?: any[];
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt', // Explicitly set JWT strategy
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null
        }

        await dbConnect()

        // Use MongoDB native collection for better type control
        const db = mongoose.connection.db;
        if (!db) {
          throw new Error('Database connection failed');
        }

        // Find user in the users collection
        const user = await db.collection('users').findOne({ 
          email: credentials.email 
        }) as UserDocument | null;

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return { 
          id: user._id.toString(),
          email: user.email,
          name: user.username || user.email // Include name/username
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET, // Add this if you haven't already
}

export default NextAuth(authOptions)