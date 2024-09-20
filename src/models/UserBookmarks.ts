import mongoose, { Document, Model } from 'mongoose';

export interface IUserBookmarks extends Document {
  userId: mongoose.Types.ObjectId;
  bookmarks: Array<{
    itemId: mongoose.Types.ObjectId;
    dateBookmarked: Date;
  }>;
}

const UserBookmarksSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookmarks: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Catalog' },
    dateBookmarked: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const UserBookmarks: Model<IUserBookmarks> = mongoose.models.UserBookmarks || mongoose.model<IUserBookmarks>('UserBookmarks', UserBookmarksSchema);

export default UserBookmarks;