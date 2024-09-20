import mongoose, { Document, Model } from 'mongoose';

export interface ICatalogItem extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  thumbnail: {
    trending?: {
      small: string;
      large: string;
    };
    regular: {
      small: string;
      medium: string;
      large: string;
    };
  };
  year: number;
  category: 'Movie' | 'TV Series';
  rating: string;
  isTrending: boolean;
}

const CatalogItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  thumbnail: {
    trending: {
      small: String,
      large: String
    },
    regular: {
      small: String,
      medium: String,
      large: String
    }
  },
  year: { type: Number, required: true },
  category: { type: String, enum: ['Movie', 'TV Series'], required: true },
  rating: String,
  isTrending: { type: Boolean, default: false }
});

const Catalog: Model<ICatalogItem> = mongoose.models.Catalog || mongoose.model<ICatalogItem>('Catalog', CatalogItemSchema);

export default Catalog;