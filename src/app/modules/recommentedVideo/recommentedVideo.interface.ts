import { Schema } from "mongoose";

export interface IRecommentedVideo {
    userId: Schema.Types.ObjectId; // Reference to the User who recommented
    venueId: Schema.Types.ObjectId; // Reference to the User who recommented
    videoUrl: string;
    paymentStatus: string;
    isExpired?: boolean;
  }