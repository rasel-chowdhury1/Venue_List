import { Schema } from "mongoose";

export interface IDiscoverMauritius {
    userId: Schema.Types.ObjectId; // Reference to the User
  venueId: Schema.Types.ObjectId; // Reference to the Venue
  thumbnailImage: "";
    videoUrl: string;
  createdAdmin: boolean;
    isDeleted: boolean;
  }