import { Router } from 'express';
import { ReviewController } from './review.controller';
import auth from '../../middleware/auth';

export const ReviewRoutes = Router();

ReviewRoutes
  .post(
    '/add', 
    auth('user', 'admin'), 
    ReviewController.createReview
  )

  .patch(
    "/update/:id", 
    auth('user'), 
    ReviewController.updateReviewById
  )

  .get(
    '/venue/:venueId', 
    ReviewController.getReviewsForEvent
  )

  .delete(
    '/:id',
    auth('user'),
    ReviewController.deleteReviewById
  )
