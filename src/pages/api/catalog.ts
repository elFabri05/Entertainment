import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '../../lib/mongodb';
import Catalog, { ICatalogItem } from '../../models/Catalog';
import UserBookmarks, { IUserBookmarks } from '../../models/UserBookmarks';

interface ExtendedNextApiRequest extends NextApiRequest {
  query: {
    userId?: string;
  };
}

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { userId } = req.query;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const catalogItems: ICatalogItem[] = await Catalog.find({});
        let bookmarkedItems: mongoose.Types.ObjectId[] = [];

        if (userId) {
          const userBookmarks: IUserBookmarks | null = await UserBookmarks.findOne({ userId });
          bookmarkedItems = userBookmarks ? userBookmarks.bookmarks.map(b => b.itemId) : [];
        }

        const catalogWithBookmarks = catalogItems.map(item => {
          const plainItem = item.toObject();
          return {
            ...plainItem,
            _id: plainItem._id.toString(), 
            isBookmarked: bookmarkedItems.some(id => id.equals(item._id))
          };
        });

        res.status(200).json({ success: true, data: catalogWithBookmarks });
      } catch (error) {
        console.error('Error in catalog API:', error);
        res.status(400).json({ success: false, error: 'Failed to fetch catalog items' });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}