import { Schema, model } from 'mongoose';
import { IReview } from './review.interface';

const ReviewSchema = new Schema<IReview>(
  {
    venueId: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Review = model<IReview>('Review', ReviewSchema);

export default Review;
