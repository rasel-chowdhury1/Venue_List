import { Schema } from "mongoose";

export interface IReview {
    venueId: Schema.Types.ObjectId; // Reference to the Event
    userId: Schema.Types.ObjectId; // Reference to the User who commented
    rating: number;
    comment: string;
  }