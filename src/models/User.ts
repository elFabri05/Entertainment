import mongoose from 'mongoose';

// Define the User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  bookmarks: [{
    mediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    },
    dateAdded: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  // Change collection name to entertainment.users
  collection: 'users',
  // Set the database name to entertainment
  versionKey: false,
});

// Update timestamps on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Export the model
const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');

export default User;