import { model, Schema } from "mongoose";
import { IDiscoverMauritius } from "./discoverMauritius.interface";

const DiscoverMauritiusSchema = new Schema<IDiscoverMauritius>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      venueId: {
        type: Schema.Types.ObjectId,
        ref: 'Venue',
        required: true,
    },
    thumbnailImage: {
      type: String,
      default: ""
    },
      videoUrl: {
        type: String,
        required: true,
      },
      createdAdmin: {
        type: Boolean,
        required: false,
    },
      isDeleted: {
        type: Boolean,
        default: false
      }
    },
    {
      timestamps: true,
    }
  );
  
  const DiscoverMauritius = model<IDiscoverMauritius>('DiscoverMauritius', DiscoverMauritiusSchema);
  
  export default DiscoverMauritius;