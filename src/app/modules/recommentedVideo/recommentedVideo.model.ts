import { Schema, model } from 'mongoose';
import { IRecommentedVideo } from './recommentedVideo.interface';


const RecommentedVideoSchema = new Schema<IRecommentedVideo>(
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
    videoUrl: {
      type: String,
      required: true
    },
    paymentStatus: {
      type: String,
      required: true
    },
    isExpired: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true,
  }
);

const RecommentedVideo = model<IRecommentedVideo>('RecommentedVideo', RecommentedVideoSchema);

export default RecommentedVideo;
