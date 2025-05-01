import { Document, Schema } from "mongoose";

export interface IVenue extends Document {
    userId: Schema.Types.ObjectId
    name: string;
    phone: string;
    category: string;
    websiteUrl?: string;
    country?: string;
    cityTown: string;
    postalAddress: string;
    description: string;
    photos?: string[]; // URLs of photos
    video?: string[]; // URLs of videos
    adminVerified: boolean;
    status?: string;
    acceptedAt?: string;
    deletedAt?: Date;
    isDeleted: boolean;
    duration?: string
  }