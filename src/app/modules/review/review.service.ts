
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import Review from './review.model';

const createReview = async (data: any) => {
  const review = await Review.create(data);
  if (!review) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Review creation failed');
  }
  return review;
};

const updateReviewById = async (id: string, data: any) => {
  // Validate that content exists (you can add more fields if needed)
  if (!data.Review) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Content is required to update the Review.');
  }

  // Fetch the Review by its ID
  const reviews = await Review.findById(id);
  
  // Check if the Review exists
  if (!reviews) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found.');
  }

  // Check if the user is the same as the one who created the Review
  if (reviews.userId.toString() !== data.userId.toString()) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to update this Review.');
  }


  // Update the Review with the new data
  const updatedReview = await Review.findByIdAndUpdate(id, {Review: data.Review}, { new: true });

  // Return the updated Review
  return updatedReview;
}

const getReviewsForEvent = async (eventId: string) => {
  return await Review.find({ eventId }).populate("userId");
};

// Delete Review by ID function with user validation
const deleteReviewById = async (ReviewId: string, userId: string) => {
  // Find the Review by its ID
  const review = await Review.findById(ReviewId);

  // If the Review doesn't exist, throw an error
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found.');
  }

  // Check if the user is the one who created the Review
  if (review.userId.toString() !== userId.toString()) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to delete this Review.');
  }

  // Delete the Review
  await Review.findByIdAndDelete(ReviewId);

  return 'Review deleted successfully' ;
};

export const ReviewService = {
  createReview,
  updateReviewById,
  getReviewsForEvent,
  deleteReviewById
};
