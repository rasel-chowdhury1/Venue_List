import { Schema } from "mongoose";

export interface IRecommentedVideo {
    userId: Schema.Types.ObjectId; // Reference to the User who recommented
    venueId: Schema.Types.ObjectId; // Reference to the User who recommented
    title: string;
    thumbnailImage: string;
    videoUrl: string;
    status: 'pending' | 'accepted' | 'deleted' | 'rejected';
    createdAdmin?: boolean;
    subscriptionId?: Schema.Types.ObjectId;
    expiryDate?: Date;
  }