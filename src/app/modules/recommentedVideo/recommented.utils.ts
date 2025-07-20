import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse";
import MySubscription from "../mySubscription/mySubscription.model";
import RecommentedVideo from "./recommentedVideo.model";
import httpStatus from 'http-status';

interface IUserRequest extends Request {
  user: any;
  subsId?: string;
}


export const checkIsRecommendedSubscription = () => {
  return catchAsync(async (req: IUserRequest, res: Response, next: NextFunction) => {
    const { userId } = req.user;

    // 1. Find all "recommended" subscriptions for this user
    const recommendedSubscriptions = await MySubscription.find({ user: userId, type: "recommended" });
    
    console.log({recommendedSubscriptions})
    // If no recommended subscriptions found, user needs to buy one
    if (!recommendedSubscriptions || recommendedSubscriptions.length === 0) {
      sendResponse(res, {
        statusCode: httpStatus.CONFLICT,
        success: false,
        message: "Please purchase a recommended subscription to create a recommended video.",
        data: null,
      });
    }

    // 2. Check if user already uploaded a recommended video for any of these subscriptions
    for (const subscription of recommendedSubscriptions) {
      const existingVideo = await RecommentedVideo.findOne({ userId, subscriptionId: subscription._id });

      console.log("existingVideo -->>> ", existingVideo)
      if (!existingVideo) {
        req.subsId = subscription._id
        // User has a subscription without a video uploaded yet — allow proceeding
        return next();
      }
    }

    // 3. If all recommended subscriptions already have videos uploaded, block further uploads
    sendResponse(res, {
      statusCode: httpStatus.CONFLICT,
      success: false,
      message: "You have already created a recommended video for all your recommended subscriptions. Please purchase another subscription to upload more videos.",
      data: null,
    });
  });
};