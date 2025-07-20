import { Document, Schema } from 'mongoose';

export interface IVenue extends Document {
  userId: Schema.Types.ObjectId;
  email: string;
  profileImage: string;
  name: string;
  phone: string;
  category: Schema.Types.ObjectId;
  subcategory?: string;
  secondarySubcategory?: string;
  websiteUrl?: string;
  country?: string;
  cityTown: string;
  postalAddress: string;
  description: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  longitude?: string;
  latitude?: string;
  photos?: string[]; // URLs of photos
  video?: string[]; // URLs of videos
  menuPhotos?: string[]; // URLs of videos
  generateQR?: boolean;
  adminVerified: boolean;
  status?: string;
  rating?: number;
  createdAdmin: boolean;
  acceptedAt?: string;
  deletedAt?: Date;
  blockedAt?: Date;
  isBlocked: boolean;
  isDeleted: boolean;
  duration?: string;
}
