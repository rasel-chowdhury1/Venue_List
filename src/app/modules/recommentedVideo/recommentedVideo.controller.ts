import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { RecommendedService } from "./recommentedVideo.service";
import sendResponse from "../../utils/sendResponse";

const createRecommentedVideo = catchAsync(async (req: Request, res: Response) => {
    req.body.userId = req.user.userId;
  
    console.log("review body -->>> ", req.body);
    const result = await RecommendedService.createRecommentedVideo(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Recommenteded video created successfully',
      data: result,
    });
  });


export const RecommendVideoController = {
    createRecommentedVideo,
}