import { Router } from 'express';
import auth from '../../middleware/auth';
import { RecommendVideoController } from './recommentedVideo.controller';
import fileUpload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import { checkIsRecommendedSubscription } from './recommented.utils';
const upload = fileUpload('./public/uploads/recommented');

export const RecommendedRoutes = Router();

RecommendedRoutes
  .post(
    '/add', 
    auth('user'), 
    // checkIsRecommendedSubscription(),
    upload.fields([
      { name: 'thumbnailImage', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
    parseData(),
    RecommendVideoController.createRecommentedVideo
  )

  .post(
    "/admin/add",
    auth("admin"),
    upload.fields([
      { name: 'thumbnailImage', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
    parseData(),
    RecommendVideoController.createAdminRecommentedVideo
  )

  .get(
    "/:status",
    RecommendVideoController.getStatusRecommentedVideos
  )

  .patch(
    "/update/:id", 
    auth('user', 'admin'), 
    RecommendVideoController.updateRecommentedVideoStatus
  )

  .patch(
    "/updateStatus/:id", 
    auth('user', 'admin'), 
    RecommendVideoController.updateRecommentedVideoStatus
  )

  // .get(
  //   '/venue/:venueId', 
  //   ReviewController.getReviewsForEvent
  // )

  // .delete(
  //   '/:id',
  //   auth('user'),
  //   ReviewController.deleteReviewById
  // )
