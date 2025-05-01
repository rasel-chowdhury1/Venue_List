import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { discoverMauritiusService } from "./discoverMauritius.service";

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
    getAllDiscoverMauritius
}
  