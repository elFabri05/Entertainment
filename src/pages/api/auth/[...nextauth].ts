import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare, hash } from 'bcrypt';
// You'll need to set up your database connection
// import { db } from '@/lib/db';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials) return null;

        const { email, password, isSignUp } = credentials;

        if (isSignUp) {
          // Handle sign-up
          try {
            // Check if user already exists
            const existingUser = await db.user.findUnique({ where: { email } });
            if (existingUser) {
              throw new Error('User already exists');
            }

            // Create new user
            const hashedPassword = await hash(password, 10);
            const user = await db.user.create({
              data: {
                email,
                password: hashedPassword,
              },
            });

            return user;
          } catch (error) {
            console.error('Sign-up error:', error);
            return null;
          }
        } else {
          // Handle sign-in
          const user = await db.user.findUnique({ where: { email } });
          if (user && await compare(password, user.password)) {
            return user;
          }
          return null;
        }
      }
    })
  ],
  // ... other NextAuth options
});