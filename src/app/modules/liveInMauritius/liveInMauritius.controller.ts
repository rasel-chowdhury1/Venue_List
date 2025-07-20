import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from 'http-status';
import { uploadFileToS3, uploadMultipleFilesToS3 } from "../../middleware/fileUploadS3";
import fs from 'fs';
import { liveInMauritiusService } from "./liveInMauritius.service";

const createAdminLiveInMauritiusVideo = catchAsync(async (req: Request, res: Response) => {

  
    req.body.userId = req.user.userId;
    req.body.createdAdmin = true;

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
    const result = await liveInMauritiusService.createAdminLiveInMauritiusVideo(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'LiveInMauritius video created successfully',
      data: result,
    });
    
  });

const getAllLiveInMauritius = catchAsync(async (req: Request, res: Response) => {
    const result = await liveInMauritiusService.getAllLiveInMauritius();
  
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: result,
      message: 'All liveInMauritius fetched successfully!',
    });
  });


export const liveInMauritiusController = {
    createAdminLiveInMauritiusVideo,
    getAllLiveInMauritius
}
   