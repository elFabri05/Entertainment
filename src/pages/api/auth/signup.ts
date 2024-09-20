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

  await dbConnect();
  
  try {
    const { email, password }: { email: string; password: string } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(422).json({ message: 'User already exists' });
    }

    // Hash password
    const salt: string = await bcrypt.genSalt(10);
    const hashedPassword: string = await bcrypt.hash(password, salt);

    // Create new user with username set to email
    const user = await User.create({
      email,
      password: hashedPassword,
      username: email, // Set username to email
    });

    // Access _id as a string directly
    const userId = user._id.toString();

    res.status(201).json({ 
      message: 'User created', 
      userId: userId
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
}