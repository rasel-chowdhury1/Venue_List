import { Schema, model } from 'mongoose';
import { IVenue } from './venue.interface';

const venueSchema = new Schema<IVenue>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      // unique: true, // Ensures that a user can only have one venue
    },
    email: {
      type: String,
      required: true
    },
    profileImage: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: ""
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    subcategory: {
      type: String,
      defult: '',
    },
    secondarySubcategory: {
      type: String,
      defult: '',
    },
    websiteUrl: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    cityTown: {
      type: String,
      required: true,
    },
    postalAddress: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    photos: [{ type: String }], // store URLs of uploaded photos
    video: [{ type: String }], // store URLs of uploaded videos
    menuPhotos: [{ type: String }], // store URLs of uploaded videos
    generateQR: {
      type: Boolean,
      default: false,
    },
    adminVerified: {
      type: Boolean,
      default: false,
    }, // Initially false, becomes true when admin verifies
    status: {
      type: String,
      enum: ['pending', 'accepted', 'deleted', 'blocked'],
      default: 'pending',
    }, // Tracks the status of the venue
    rating: {
      type: Number,
      default: 0,
    },
    createdAdmin: {
      type: Boolean,
      default: false,
    },
    acceptedAt: {
      type: Date,
      default: null,
    }, // Tracks the date when the venue is accepted by the admin
    deletedAt: {
      type: Date,
      default: null,
    }, // Tracks the date when the venue is deleted by the admin
    blockedAt: {
      type: Date,
      default: null,
    }, // Tracks the date when the venue is deleted by the admin
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// ✅ Ensure MongoDB applies the 2dsphere index
venueSchema.index({ location: '2dsphere' });

// Create an index on the `category` field for optimized searching and sorting
venueSchema.index({ category: 1 }); // 1 for ascending order (or -1 for descending)

const Venue = model<IVenue>('Venue', venueSchema);

export default Venue;

const venueVisitorSchema = new Schema(
  {
    venueId: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    visitedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const VenueVisitor = model('VenueVisitor', venueVisitorSchema);

const venueBookingSchema = new Schema(
  {
    venueId: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bookedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const VenueBooking = model('VenueBooking', venueBookingSchema);
