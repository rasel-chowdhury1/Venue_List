import { Schema } from "mongoose";

export interface IDiscoverMauritius {
    venueId: Schema.Types.ObjectId; // Reference to the Venue
    venueName: string;
    location: string;
    videoUrl: string;
    websiteUrl?: string;
    duration: string;
    isDeleted: boolean;
  }