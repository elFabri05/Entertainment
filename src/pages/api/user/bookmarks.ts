// src/pages/api/user/bookmarks.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

type BookmarkResponse = {
  success: boolean;
  message: string;
  bookmarks?: any[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BookmarkResponse>
) {
  try {
    // Get the user session using getServerSession (no longer unstable)
    const session = await getServerSession(req, res, authOptions);
    
    console.log("API Route - Session check:", session);
    console.log("API Route - Request headers:", req.headers);
    
    if (!session) {
      console.log("API Route - No session found");
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // Connect to the database
    await dbConnect();
    
    // Get user email from session
    const userEmail = session.user?.email;

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'User email not found in session' });
    }

    console.log("API Route - User email:", userEmail);

    // Access MongoDB directly
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    // Access the users collection from the entertainment database
    const usersCollection = db.collection('users');
    
    // GET - Retrieve user's bookmarks
    if (req.method === 'GET') {
      const user = await usersCollection.findOne({ email: userEmail });
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Bookmarks retrieved successfully',
        bookmarks: user.bookmarks || []
      });
    }
    
    // POST - Add a bookmark
    else if (req.method === 'POST') {
      const { mediaId } = req.body;
      
      if (!mediaId) {
        return res.status(400).json({ success: false, message: 'Media ID is required' });
      }
      
      // Create ObjectId using the newer method
      const mediaObjectId = mongoose.Types.ObjectId.createFromHexString(mediaId);
      
      // Add bookmark if it doesn't exist already
      const result = await usersCollection.updateOne(
        { email: userEmail },
        { 
          $addToSet: { 
            bookmarks: { 
              mediaId: mediaObjectId,
              dateAdded: new Date()
            } 
          } 
        }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Get the updated user data
      const updatedUser = await usersCollection.findOne({ email: userEmail });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Bookmark added successfully',
        bookmarks: updatedUser?.bookmarks || []
      });
    }
    
    // DELETE - Remove a bookmark
    else if (req.method === 'DELETE') {
      const { mediaId } = req.body;
      
      if (!mediaId) {
        return res.status(400).json({ success: false, message: 'Media ID is required' });
      }
      
      // Create ObjectId using the newer method
      const mediaObjectId = mongoose.Types.ObjectId.createFromHexString(mediaId);
      
      // Use explicit type casting to bypass TypeScript checking
      const pullOperation = {
        $pull: {
          bookmarks: { 
            mediaId: mediaObjectId
          } 
        }
      } as any;
      
      // Remove the bookmark
      const result = await usersCollection.updateOne(
        { email: userEmail },
        pullOperation
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Get the updated user data
      const updatedUser = await usersCollection.findOne({ email: userEmail });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Bookmark removed successfully',
        bookmarks: updatedUser?.bookmarks || []
      });
    }
    
    // Method not allowed
    else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ 
        success: false, 
        message: `Method ${req.method} Not Allowed` 
      });
    }
  } catch (error: any) {
    console.error('Error handling bookmark operation:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Operation failed: ${error.message}` 
    });
  }
}