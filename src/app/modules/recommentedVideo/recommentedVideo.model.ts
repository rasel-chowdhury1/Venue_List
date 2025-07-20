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
      required: false,
    },
    title: {
      type: String,
      default: '',
      required: false
    },
    thumbnailImage: {
      type: String,
      required: true
    },
    videoUrl: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'deleted'],
      default: "pending"
    },
    createdAdmin: {
      type: String,
      required: false
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      required: false,
    },
    expiryDate: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

const RecommentedVideo = model<IRecommentedVideo>('RecommentedVideo', RecommentedVideoSchema);

export default RecommentedVideo;
