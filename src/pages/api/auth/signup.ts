import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

type SignupResponse = {
  message: string;
  userId?: string;
};

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<SignupResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Ensure Content-Type is JSON
  if (req.headers['content-type'] !== 'application/json') {
    return res.status(400).json({ message: 'Content-Type must be application/json' });
  }

  // Connect to the database with error handling
  try {
    await dbConnect();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ message: 'Database connection error' });
  }

  try {
    const { email, password }: { email: string; password: string } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Validate email format and password length
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(422).json({ message: 'User already exists' });
    }

    // Hash password using environment variable for salt rounds
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
    const salt: string = await bcrypt.genSalt(saltRounds);
    const hashedPassword: string = await bcrypt.hash(password, salt);

    // Create new user with username set to email
    const user = await User.create({
      email,
      password: hashedPassword,
      username: email, // Set username to email
      bookmarks: [], // Initialize empty bookmarks array
    });

    // Access _id as a string directly
    const userId = user._id.toString();

    res.status(201).json({ 
      message: 'User created', 
      userId: userId
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      message: process.env.NODE_ENV === 'development' 
        ? `Error creating user: ${error.message}` 
        : 'Internal server error'
    });
  }
}