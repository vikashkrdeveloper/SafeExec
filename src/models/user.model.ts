// User Model Schema
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    avatar: String,
  },
  stats: {
    totalSubmissions: { type: Number, default: 0 },
    successfulSubmissions: { type: Number, default: 0 },
    preferredLanguage: { type: String, default: 'python' },
    lastActive: { type: Date, default: Date.now },
  },
  limits: {
    maxSubmissionsPerHour: { type: Number, default: 50 },
    maxCodeLength: { type: Number, default: 10000 },
    allowedLanguages: [
      { type: String, default: ['python', 'javascript', 'java'] },
    ],
  },
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.index({ 'stats.lastActive': -1 });

export const UserModel = mongoose.model('User', userSchema);
