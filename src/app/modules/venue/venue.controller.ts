import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { VenueService } from "./venue.service";
import httpStatus from "http-status"; // Assuming http-status is imported
import { storeFiles } from "../../utils/fileHelper";
import path from "path";
import { getVideoDuration } from "./venue.utils";
import AppError from "../../error/AppError";

const createVenue = catchAsync(async (req: Request, res: Response) => {
    const {userId,email} = req.user;
    req.body.userId = userId;
    req.body.email = email;
    console.log("req files -->>>> ", req.files)
      // Check if there are uploaded files
    if (req.files) {
        try {
        // Use storeFiles to process all uploaded files
        const filePaths = storeFiles(
            'venue',
            req.files as { [fieldName: string]: Express.Multer.File[] },
        );

        // Set photos (multiple files)
        if (filePaths.photos && filePaths.photos.length > 0) {
            req.body.photos = filePaths.photos; // Assign full array of photos
        }

        // Set image (single file)
        if (filePaths.video && filePaths.video.length > 0) {
            const videoFile = filePaths.video[0];
            req.body.video = videoFile; // Assign first image

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
    const result = await VenueService.createVenue(req.body)

    
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Venue created successfully.',
      data: result,
    });
});

const updateVenue = catchAsync(async (req: Request, res: Response) => {
    const { venueId } = req.params; // Fetch venueId from URL params
    const updatedVenue = await VenueService.updateVenueById(venueId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Venue updated successfully.",
        data: updatedVenue,
    });
});

const getSpecificVenue = catchAsync(async (req: Request, res: Response) => {
    const { venueId } = req.params; // Fetch venueId from URL params
    const venue = await VenueService.getSpecificVenue(venueId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Specific venue fetched successfully.",
        data: venue,
    });
});

const getSpecificCategoryVenues = catchAsync(async (req: Request, res: Response) => {
    const {categoryName} = req.params;


    const venues = await VenueService.getSpecificCategoryVenues(categoryName, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Specific category venues fetched successfully.",
        data: venues,
    });
});

const getPendingVenues = catchAsync(async (req: Request, res: Response) => {
    const venue = await VenueService.getPendingVenues();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Pending venue fetched successfully.",
        data: venue,
    });
});


const getPopularVenues = catchAsync(async (req: Request, res: Response) => {
    const venues = await VenueService.getPopularVenue(); // Get all venues (No need for venueId here)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Popular venues fetched successfully.",
        data: venues,
    });
});


const getAllVenues = catchAsync(async (req: Request, res: Response) => {
    const venues = await VenueService.getAllVenues(); // Get all venues (No need for venueId here)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All venues fetched successfully.",
        data: venues,
    });
});

const acceptedVenueByAdmin = catchAsync(async (req: Request, res: Response) => {
    const {userId} = req.user;
    const { venueId } = req.params; // Fetch venueId from URL params
    const deletedVenue = await VenueService.acceptedVenueByAdmin(userId,venueId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Venue accepted successfully.",
        data: deletedVenue,
    });
});

const deletedVenueByAdmin = catchAsync(async (req: Request, res: Response) => {
    const { venueId } = req.params; // Fetch venueId from URL params
    const deletedVenue = await VenueService.deletedVenueByAdmin(venueId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Venue deleted successfully.",
        data: deletedVenue,
    });
});

const deleteSpecificVenue = catchAsync(async (req: Request, res: Response) => {
    const { venueId } = req.params; // Fetch venueId from URL params
    const { userId } = req.user; // Get the current user's ID from the request (e.g., from JWT or session)
    const deletedVenue = await VenueService.deleteSpecificVenue(userId, venueId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Venue deleted successfully.",
        data: deletedVenue,
    });
});

export const venueController = {
    createVenue,
    updateVenue,
    getSpecificVenue,
    getPendingVenues,
    getPopularVenues,
    getSpecificCategoryVenues,
    getAllVenues,
    deleteSpecificVenue,
    acceptedVenueByAdmin,
    deletedVenueByAdmin
};
