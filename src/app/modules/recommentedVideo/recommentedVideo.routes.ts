import { Router } from 'express';
import auth from '../../middleware/auth';
import { RecommendVideoController } from './recommentedVideo.controller';

export const RecommendedRoutes = Router();

RecommendedRoutes
  .post(
    '/add', 
    auth('user'), 
    RecommendVideoController.createRecommentedVideo
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
