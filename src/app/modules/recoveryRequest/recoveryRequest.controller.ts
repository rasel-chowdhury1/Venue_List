import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { recoveryRequestService } from "./recoveryRequest.service";
import { storeFiles } from "../../utils/fileHelper";
import httpStatus from 'http-status';
import { uploadMultipleFilesToS3 } from "../../middleware/fileUploadS3";

const createRecoveryRequest = catchAsync(async (req: Request, res: Response) => {
  const { userId,email } = req.user;

  req.body.userId = userId;
  req.body.email = email;

    if (req.files) {
    try {
      const uploadedFiles = await uploadMultipleFilesToS3(
        req.files as { [fieldName: string]: Express.Multer.File[] }
      );

      console.log("uploadedFiles", uploadedFiles)


      if (uploadedFiles.supportingDocuments?.length) {
        req.body.supportingDocuments = uploadedFiles.supportingDocuments;
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

  const newRequest = await recoveryRequestService.createRecoveryRequest(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Recovery request submitted successfully',
    data: newRequest,
  });
});


const updateRecoveryRequestStatus = catchAsync(async (req: Request, res: Response) => {

  const { id } = req.params;
  const { status } = req.body;

  console.log(req.body)
  console.log({id,status})

  const updated = await recoveryRequestService.updateRecoveryRequestStatus(id, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Recovery request status updated',
    data: updated,
  });
});

const getAllAccountRecoveryRequests = catchAsync(async (req: Request, res: Response) => {

  const result = await recoveryRequestService.getAllAccountRecoveryRequests(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All account recovery requests retrieved',
    data: result,
  });
});

const getAllVenueRecoveryRequests = catchAsync(async (req: Request, res: Response) => {

  const result = await recoveryRequestService.getAllVenueRecoveryRequests(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All venue recovery requests retrieved',
    data: result,
  });
});

export const RecoveryRequestController = {
   createRecoveryRequest,
   updateRecoveryRequestStatus,
   getAllAccountRecoveryRequests,
   getAllVenueRecoveryRequests
}