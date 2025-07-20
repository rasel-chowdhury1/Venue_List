import { model, Schema } from "mongoose";
import { ILiveInMauritius } from "./liveInMauritius.interface";

const LiveInMauritiusSchema = new Schema<ILiveInMauritius>(
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
        required: false
      }
    },
    {
      timestamps: true,
    }
  );
  
  const LiveInMauritius = model<ILiveInMauritius>('LiveInMauritius', LiveInMauritiusSchema);
  
  export default LiveInMauritius;