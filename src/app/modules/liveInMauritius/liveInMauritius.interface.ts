import { Schema } from "mongoose";

export interface ILiveInMauritius {
    userId: Schema.Types.ObjectId; // Reference to the User
    venueId: Schema.Types.ObjectId; // Reference to the Venue
  thumbnailImage: string;
    videoUrl: string;
    createdAdmin: boolean;
    isDeleted: boolean;
  }