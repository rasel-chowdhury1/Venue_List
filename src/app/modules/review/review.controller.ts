import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReviewService } from './review.service';

const createReview = catchAsync(async (req: Request, res: Response) => {
  req.body.userId = req.user.userId;

  console.log('review body -->>> ', req.body);
  const result = await ReviewService.createReview(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

const updateReviewById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  req.body.userId = req.user.userId;
  const result = await ReviewService.updateReviewById(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

const getReviewsForEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getReviewsForEvent(req.params.eventId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: 'Reviews fetched successfully',
  });
});

const deleteReviewById = catchAsync(async (req: Request, res: Response) => {
  await ReviewService.deleteReviewById(req.params.id, req.user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: null,
    message: 'Reviews deleted successfully',
  });
});

export const ReviewController = {
  createReview,
  updateReviewById,
  getReviewsForEvent,
  deleteReviewById,
};
