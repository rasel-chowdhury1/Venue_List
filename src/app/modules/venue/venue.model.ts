import { Schema, model } from 'mongoose';
import { IVenue } from './venue.interface';

const venueSchema = new Schema<IVenue>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Ensures that a user can only have one venue
  },
  name: { 
    type: String, 
    required: true 
   },
  phone: { 
    type: String, 
    required: true 
  },
  category: {
     type: String, 
     required: true
    },
  websiteUrl: {
     type: String,
     required: true
    },
  country: {
     type: String, 
     required: true 
    },
  cityTown: { 
    type: String, 
    required: true 
    },
  postalAddress: {
     type: String, 
     required: true 
    },
  description: {
     type: String, 
     required: true 
    },
  photos: [
    { type: String }
   ], // store URLs of uploaded photos
  videos: [
    { type: String }
   ], // store URLs of uploaded videos
  adminVerified: { 
    type: Boolean, 
    default: false 
  }, // Initially false, becomes true when admin verifies
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'deleted'],
    default: 'pending' 
  }, // Tracks the status of the venue
  acceptedAt: { 
    type: Date, 
    default: null 
  }, // Tracks the date when the venue is accepted by the admin
  deletedAt: { 
    type: Date, 
    default: null 
  }, // Tracks the date when the venue is deleted by the admin
  isDeleted: {
    type: Boolean, 
    default: false
  }
}, { timestamps: true });

const Venue = model<IVenue>('Venue', venueSchema);

export default Venue;