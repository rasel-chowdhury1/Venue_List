import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { discoverMauritiusService } from "./discoverMauritius.service";
import httpStatus from 'http-status';
import { uploadFileToS3, uploadMultipleFilesToS3 } from "../../middleware/fileUploadS3";
import fs from 'fs';

const createAdminDiscoverMauritiusVideo = catchAsync(async (req: Request, res: Response) => {

  
    req.body.userId = req.user.userId;
    req.body.createdAdmin = true;

    // if (req?.file) {
    //   // req.body.videoUrl = storeFile('video', req?.file?.filename);

    //   // upload file in bucket function is done
    //       try {
    //         const data = await uploadFileToS3(req.file)
      
      
    //         console.log("data----->>>> ",data)
    //         // deleting file after upload
    //         fs.unlinkSync(req.file.path)
        
    //         req.body.videoUrl = data.Location;
    //       } catch (error) {
    //         console.log("====erro9r --->>> ", error)
    //         if(fs.existsSync(req.file.path)){
    //           fs.unlinkSync(req.file.path)
    //         }
    //       }
  // }
  
  // Check if there are uploaded files
        if (req.files) {
          try {
            
            console.log("testing")
          
            const uploadedFiles = await uploadMultipleFilesToS3(
                  req.files as { [fieldName: string]: Express.Multer.File[] }
                );
                if (uploadedFiles.thumbnailImage[0]) {
                  req.body.thumbnailImage = uploadedFiles.thumbnailImage[0];
                }
                if (uploadedFiles.video[0]) {
                  req.body.videoUrl = uploadedFiles.video[0];
            }
            
            console.log("uploadedFiles =>>", uploadedFiles)
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
    const result = await discoverMauritiusService.createAdminDiscoverMauritiusVideo(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Recommenteded video created successfully',
      data: result,
    });
    
});
  
const updateAdminDiscoverMauritiusVideo = catchAsync(async (req: Request, res: Response) => {

  const { discoverId } = req.params;
  
  // Check if there are uploaded files
        if (req.files) {
          try {
          console.log("update admin disocover mauritious video ->>> starting")
            const uploadedFiles = await uploadMultipleFilesToS3(
                  req.files as { [fieldName: string]: Express.Multer.File[] }
                );
                if (uploadedFiles.thumbnailImage && uploadedFiles.thumbnailImage.length > 0) {
      req.body.thumbnailImage = uploadedFiles.thumbnailImage[0];
    }

    if (uploadedFiles.video && uploadedFiles.video.length > 0) {
      req.body.videoUrl = uploadedFiles.video[0];
    }
            console.log("update admin disocover mauritious video ->>> ending")
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
    const result = await discoverMauritiusService.updateAdminDiscoverMauritiusVideo(discoverId, req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Discover Mauritius video update successfully',
      data: result,
    });
    
});
  
const deleteAdminDiscoverMauritiusVideo = catchAsync(async (req: Request, res: Response) => {

  const { discoverId } = req.params;
  

    console.log("review body -->>> ", req.body);
    const result = await discoverMauritiusService.deleteAdminDiscoverMauritiusVideo(discoverId);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Discover Mauritius video deleted successfully',
      data: result,
    });
    
  });

const getAllDiscoverMauritius = catchAsync(async (req: Request, res: Response) => {
    const result = await discoverMauritiusService.getAllDiscoverMauritius();
  
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: result,
      message: 'All discover mauritiuse fetched successfully!',
    });
  });


export const discoverMauritiusController = {
  createAdminDiscoverMauritiusVideo,
  getAllDiscoverMauritius,
  updateAdminDiscoverMauritiusVideo,
  deleteAdminDiscoverMauritiusVideo 
}
  