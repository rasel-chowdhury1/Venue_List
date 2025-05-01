import { model, Schema } from "mongoose";
import { IDiscoverMauritius } from "./discoverMauritius.interface";

const DiscoverMauritiusSchema = new Schema<IDiscoverMauritius>(
    {
      venueId: {
        type: Schema.Types.ObjectId,
        ref: 'Venue',
        required: true,
        unique: true,
      },
      venueName: {
        type: String,
        required: true,
      },
      location: {
        type: String,
        required: true,
      },
      videoUrl: {
        type: String,
        required: true,
      },
      websiteUrl: {
        type: String,
        required: true,
      },
      duration: {
        type: String,
        default: "10 min"
      },
      isDeleted: {
        type: Boolean,
        required: false
      }
    },
    {
      timestamps: true,
    }
  );
  
  const DiscoverMauritius = model<IDiscoverMauritius>('DiscoverMauritius', DiscoverMauritiusSchema);
  
  export default DiscoverMauritius;