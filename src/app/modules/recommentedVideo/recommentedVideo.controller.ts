import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { RecommendedService } from "./recommentedVideo.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status';
import { uploadFileToS3, uploadMultipleFilesToS3 } from "../../middleware/fileUploadS3";


const createRecommentedVideo = catchAsync(async (req: Request, res: Response) => {
    req.body.userId = req.user.userId;
    // req.body.subscriptionId = req.subsId;
    
// Check if there are uploaded files
      if (req.files) {
        try {
        
          const uploadedFiles = await uploadMultipleFilesToS3(
                req.files as { [fieldName: string]: Express.Multer.File[] }
              );
              if (uploadedFiles.thumbnailImage[0]) {
                req.body.thumbnailImage = uploadedFiles.thumbnailImage[0];
              }
              if (uploadedFiles.video[0]) {
                req.body.videoUrl = uploadedFiles.video[0];
              }
        } catch (error: any) {
          console.error('Error processing files:', error.message);
          return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'Failed to process uploaded files',
            data: null,
          });
        }
      }
    const result = await RecommendedService.createRecommentedVideo(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Recommenteded video created successfully',
      data: result,
    });
  });

const createAdminRecommentedVideo = catchAsync(async (req: Request, res: Response) => {

  
    req.body.userId = req.user.userId;
    req.body.createdAdmin = true;
    req.body.status = 'accepted';


    console.log("req files ===>>>>>   ",req.files)
    // Check if there are uploaded files
      if (req.files) {
        try {
        
          const uploadedFiles = await uploadMultipleFilesToS3(
                req.files as { [fieldName: string]: Express.Multer.File[] }
              );
              if (uploadedFiles.thumbnailImage[0]) {
                req.body.thumbnailImage = uploadedFiles.thumbnailImage[0];
              }
              if (uploadedFiles.video[0]) {
                req.body.videoUrl = uploadedFiles.video[0];
              }
        } catch (error: any) {
          console.error('Error processing files:', error.message);
          return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'Failed to process uploaded files',
            data: null,
          });
        }
      }

    console.log("review body -->>> ", req.body);
    const result = await RecommendedService.createAdminRecommentedVideo(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Recommenteded video created successfully',
      data: result,
    });
    
  });

  const updateRecommentedVideo = catchAsync(async (req: Request, res: Response) => {

    const result = await RecommendedService.getRecomenetedVideos();
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Recommenteded video updated successfully',
      data: result,
    });
  });

  const updateRecommentedVideoStatus = catchAsync(async (req: Request, res: Response) => {
    const {id} = req.params;
    const {status} = req.body;

    const result = await RecommendedService.updateRecommentedVideoStatus(id, status);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Recommenteded video status updated successfully',
      data: result,
    });
  });

const getRecommentedVideo = catchAsync(async (req: Request, res: Response) => {

    const result = await RecommendedService.getRecomenetedVideos();
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Recommenteded video fetched successfully',
      data: result,
    });
  });

const getStatusRecommentedVideos = catchAsync(async (req: Request, res: Response) => {
  
  const {status} = req.params;
  const result = await RecommendedService.getStatusRecommentedVideos({status});
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Recommenteded accepted video fetched successfully',
    data: result,
  });
});


export const RecommendVideoController = {
    createRecommentedVideo,
    createAdminRecommentedVideo,
    updateRecommentedVideo,
    updateRecommentedVideoStatus,
    getRecommentedVideo,
    getStatusRecommentedVideos 
}