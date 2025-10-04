import { Request, Response } from 'express';
import httpStatus from 'http-status'; // Assuming http-status is imported
import catchAsync from '../../utils/catchAsync';
import { storeFiles } from '../../utils/fileHelper';
import sendResponse from '../../utils/sendResponse';
import { VenueService } from './venue.service';
import { uploadMultipleFilesToS3 } from '../../middleware/fileUploadS3';
import AppError from '../../error/AppError';

const createVenue = catchAsync(async (req: Request, res: Response) => {
  const { userId, email } = req.user;
  req.body.userId = userId;
  req.body.email = email;
  console.log('req files -->>>> ', req.files);
  // Check if there are uploaded files
  if (req.files) {
    try {
      console.log("req.files data ", req.files)
      const uploadedFiles = await uploadMultipleFilesToS3(
        req.files as { [fieldName: string]: Express.Multer.File[] }
      );


      // Assign files to req.body
      if (uploadedFiles.profile?.[0]) {
        req.body.profileImage = uploadedFiles.profile[0];
      }

      if (uploadedFiles.photos?.length) {
        req.body.photos = uploadedFiles.photos;
      }

      if (uploadedFiles.video?.[0]) {
        req.body.video = uploadedFiles.video[0];
      }

      if (uploadedFiles.menuPhotos?.length) {
        req.body.menuPhotos = uploadedFiles.menuPhotos;
      }

      console.log('alldone ', req.body);
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

  const result = await VenueService.createVenue(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Venue created successfully.',
    data: result,
  });
});

// const createVenueByAdmin = catchAsync(async (req: Request, res: Response) => {
//   // const {userId,email} = req.user;
//   // req.body.userId = userId;
//   // req.body.email = email;
//   req.body.adminVerified = true;
//   req.body.createdAdmin = true;
//   req.body.status = 'accepted';
//   console.log('req files -->>>> ', req.files);

//   // Check if there are uploaded files
//   if (req.files) {
//     try {
//       // Use storeFiles to process all uploaded files
//       const filePaths = storeFiles(
//         'venue',
//         req.files as { [fieldName: string]: Express.Multer.File[] },
//       );

//       if (filePaths.profile && filePaths.profile.length > 0) {
//         req.body.profileImage = filePaths.profile[0];
//       }

//       // Set photos (multiple files)
//       if (filePaths.photos && filePaths.photos.length > 0) {
//         req.body.photos = filePaths.photos; // Assign full array of photos
//       }

//       // Set image (single file)
//       if (filePaths.video && filePaths.video.length > 0) {
//         const videoFile = filePaths.video[0];
//         req.body.video = videoFile; // Assign first image
//       }
//     } catch (error: any) {
//       console.error('Error processing files:', error.message);
//       return sendResponse(res, {
//         statusCode: httpStatus.BAD_REQUEST,
//         success: false,
//         message: 'Failed to process uploaded files',
//         data: null,
//       });
//     }
//   }

//   const result = await VenueService.createVenueByAdmin(req.body);

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: 'Venue created successfully.',
//     data: result,
//   });
// });

// const createVenueByAdmin = catchAsync(async (req: Request, res: Response) => {

//   req.body.adminVerified = true;
//   req.body.createdAdmin = true;
//   req.body.status = 'accepted';




// console.log(req.files)
//   if (req.files) {
//     try {
//       console.log("req.files data ", req.files)
//       const uploadedFiles = await uploadMultipleFilesToS3(
//         req.files as { [fieldName: string]: Express.Multer.File[] }
//       );

//       // Assign files to req.body
//       if (uploadedFiles.profile?.[0]) {
//         req.body.profileImage = uploadedFiles.profile[0];
//       }

//       if (uploadedFiles.photos?.length) {
//         req.body.photos = uploadedFiles.photos;
//       }

//       if (uploadedFiles.video?.[0]) {
//         req.body.video = uploadedFiles.video[0];
//       }

//       if (uploadedFiles.menuPhotos?.length) {
//         req.body.menuPhotos = uploadedFiles.menuPhotos;
//       }

//       console.log("create venue by admin -->>> ",req.body)
//     } catch (error: any) {
//       console.error('🔥 Error in uploadMultipleFilesToS3:', error.message);
//       return sendResponse(res, {
//         statusCode: httpStatus.BAD_REQUEST,
//         success: false,
//         message: 'File upload failed',
//         data: null,
//       });
//     }
//   }


//     console.log(req.body)
//   const result = await VenueService.createVenueByAdmin(req.body);

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: 'Venue created successfully.',
//     data: result,
//   });
// });


const createVenueByAdmin = catchAsync(async (req: Request, res: Response) => {

  const {userId} = req.user;
  
  req.body.adminVerified = true;
  req.body.createdAdmin = true;
  req.body.status = 'accepted';
  req.body.userId = userId;



console.log(req.files)
  if (req.files) {
    try {
      console.log("req.files data ", req.files)
      const uploadedFiles = await uploadMultipleFilesToS3(
        req.files as { [fieldName: string]: Express.Multer.File[] }
      );

      // Assign files to req.body
      if (uploadedFiles.profile?.[0]) {
        req.body.profileImage = uploadedFiles.profile[0];
      }

      if (uploadedFiles.photos?.length) {
        req.body.photos = uploadedFiles.photos;
      }

      if (uploadedFiles.video?.[0]) {
        req.body.video = uploadedFiles.video[0];
      }

      if (uploadedFiles.menuPhotos?.length) {
        req.body.menuPhotos = uploadedFiles.menuPhotos;
      }

      console.log("create venue by admin -->>> ",req.body)
    } catch (error: any) {
      console.error('🔥 Error in uploadMultipleFilesToS3:', error.message);
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: 'File upload failed',
        data: null,
      });
    }
  }


    console.log(req.body)
  const result = await VenueService.createVenueByAdmin(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Venue created successfully.',
    data: result,
  });
});


const addVisitorRecord = catchAsync(async (req: Request, res: Response) => {
  const { venueId } = req.params;
  const userId = req.user.userId; // assuming auth middleware

  console.log('venueId and userId data -->>> ', venueId, userId);
  const result = await VenueService.addVisitorRecord(venueId, userId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Visitor record added successfully',
    data: result,
  });
});

const addBookRecord = catchAsync(async (req: Request, res: Response) => {
  const { venueId } = req.params;
  const userId = req.user.userId; // assuming auth middleware

  console.log('review body -->>> ', req.body);
  const result = await VenueService.addBookRecord(venueId, userId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Book record added successfully',
    data: result,
  });
});

const updateVenue = catchAsync(async (req: Request, res: Response) => {
  const { venueId } = req.params; // Fetch venueId from URL params

   // Check if there are uploaded files
  if (req.files) {
    try {
console.log("req.files data ", req.files)
      const uploadedFiles = await uploadMultipleFilesToS3(
        req.files as { [fieldName: string]: Express.Multer.File[] }
      );

      console.log("uploadedFiles", uploadedFiles)

      // Assign files to req.body
      if (uploadedFiles.profile?.[0]) {
        req.body.profileImage = uploadedFiles.profile[0];
      }

      if (uploadedFiles.photos?.length) {
        req.body.photos = uploadedFiles.photos;
      }

      if (uploadedFiles.video?.[0]) {
        req.body.video = uploadedFiles.video[0];
      }

      if (uploadedFiles.menuPhotos?.length) {
        req.body.menuPhotos = uploadedFiles.menuPhotos;
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

  console.log("venue controller -->>> ", req.body);
  const updatedVenue = await VenueService.updateVenueById(venueId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Venue updated successfully.',
    data: updatedVenue,
  });
});

const getMyVenueStatus = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const venue = await VenueService.getMyVenueStatus(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My venue fetched successfully.',
    data: venue,
  });
});

const getSpecificVenue = catchAsync(async (req: Request, res: Response) => {
  const { venueId } = req.params; // Fetch venueId from URL params
  const { userId } = req.user;
  const venue = await VenueService.getSpecificVenue(venueId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Specific venue fetched successfully.',
    data: venue,
  });
});

const getSpecificVenueReviews = catchAsync(
  async (req: Request, res: Response) => {
    const { venueId } = req.params; // Fetch venueId from URL params
    const venue = await VenueService.getSpecificVenueReviews(venueId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Specific venue reviews fetched successfully.',
      data: venue,
    });
  },
);

const getSpecificVenueMonthlySummaryWithDemographics = catchAsync(
  async (req: Request, res: Response) => {
    
    const {userId} = req.user;
    const venue = await VenueService.getSpecificVenueMonthlySummaryWithDemographics(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Specefic venue monthly summary demographics successfully.',
      data: venue,
    });
  },
);

const getSpecificVenueStats = catchAsync(
  async (req: Request, res: Response) => {
    
    const {userId} = req.user;
    const venue = await VenueService.getSpecificVenueStats(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Specific venue stats fetched successfully.',
      data: venue,
    });
  },
);

const getSpecificVenueVisitorStats = catchAsync(
  async (req: Request, res: Response) => {
    
    const {userId} = req.user;
    const {range} = req.query;
    const venue = await VenueService.getSpecificVenueVisitorStats(userId, range);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Specific venue visitor stats fetched successfully.',
      data: {"type":range, "totalVisitors":venue.totalVisitors, "data": venue.data},
    });
  },
);

const getSpecificVenueBookingrStats = catchAsync(
  async (req: Request, res: Response) => {
    
    const {userId} = req.user;
    const {range} = req.query;

    console.log("req query -->>> ", req.query)
    const venue = await VenueService.getSpecificVenueVisitorStats(userId, range);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Specific venue visitor stats fetched successfully.',
      data: venue,
    });
  },
);

const getDemographicStats = catchAsync(async (req: Request, res: Response) => {

  console.log(req.user.userId, "userId")

  const venue = await VenueService.getDemographicStats(req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Specific venue stats fetched successfully.',
    data: venue,
  });
});

const getSpecificCategoryVenues = catchAsync(
  async (req: Request, res: Response) => {
    const { categoryId } = req.params;

    const venues = await VenueService.getSpecificCategoryVenues(
      categoryId,
      req.query,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Specific category venues fetched successfully.',
      data: venues,
    });
  },
);

const getShoppingCategoryVenues = catchAsync(
  async (req: Request, res: Response) => {
    const { categoryId } = req.params;

    const venues = await VenueService.getShoppingCategoryVenues(
      categoryId,
      req.query,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Shopping category venues fetched successfully.',
      data: venues,
    });
  },
);

const getPendingVenues = catchAsync(async (req: Request, res: Response) => {
  const venue = await VenueService.getPendingVenues();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pending venue fetched successfully.',
    data: venue,
  });
});

const getPopularVenues = catchAsync(async (req: Request, res: Response) => {
  const venues = await VenueService.getPopularVenue(); // Get all venues (No need for venueId here)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Popular venues fetched successfully.',
    data: venues,
  });
});

const getAllVenues = catchAsync(async (req: Request, res: Response) => {
  const venues = await VenueService.getAllVenues(); // Get all venues (No need for venueId here)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All venues fetched successfully.',
    data: venues,
  });
});

const getAllVenuess = catchAsync(async (req: Request, res: Response) => {
  const venues = await VenueService.getAllVenuess(req.query); // Get all venues (No need for venueId here)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All venues fetched successfully.',
    data: venues,
  });
});

const getDeletedVenues = catchAsync(async (req: Request, res: Response) => {
  const venues = await VenueService.getDeletedVenues(req.query); // Get all venues (No need for venueId here)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All deleted venues fetched successfully.',
    data: venues,
  });
});


const getAllLocationVenues = catchAsync(async (req: Request, res: Response) => {
  const venues = await VenueService.getAllLocationVenues(); // Get all venues (No need for venueId here)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All location venues fetched successfully.',
    data: venues,
  });
});

const acceptedVenueByAdmin = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { venueId } = req.params; // Fetch venueId from URL params
  const acceptedVenue = await VenueService.acceptedVenueByAdmin(
    userId,
    venueId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Venue accepted successfully.',
    data: acceptedVenue,
  });
});

const deletedVenueByAdmin = catchAsync(async (req: Request, res: Response) => {
  const { venueId } = req.params; // Fetch venueId from URL params
  const deletedVenue = await VenueService.deletedVenueByAdmin(venueId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Venue deleted successfully.',
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
    message: 'Venue deleted successfully.',
    data: deletedVenue,
  });
});

const blockSpecificVenueByAdmin = catchAsync(async (req: Request, res: Response) => {
  const { venueId } = req.params; // Fetch venueId from URL params
  const deletedVenue = await VenueService.blockSpecificVenueByAdmin( venueId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Venue blocked successfully.',
    data: deletedVenue,
  });
});

const unBlockSpecificVenueByAdmin = catchAsync(async (req: Request, res: Response) => {
  const { venueId } = req.params; // Fetch venueId from URL params
  const deletedVenue = await VenueService.unBlockSpecificVenueByAdmin( venueId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Venue unblocked successfully.',
    data: deletedVenue,
  });
});


const createGenerateQR = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId; // assuming auth middleware

  const result = await VenueService.createGenerateQR(userId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'generate Qr code successfully',
    data: result,
  });
});


const adminCreateGenerateQR = catchAsync(async (req: Request, res: Response) => {
  const { venueId } = req.body;

  if (!venueId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'venueId is required');
  }

  const result = await VenueService.adminGenerateQR(venueId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'QR code generated successfully',
    data: result,
  });
});


const getUncreatedGenerateQRVenue = catchAsync(async (req: Request, res: Response) => {


  console.log("hitted uncreated generate qr venue -->> ")
  const result = await VenueService.getUnCreateGenerateQR();
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Uncreated generate Qr code successfully',
    data: result || [],
  });
});

const getCreatedGenerateQRVenue = catchAsync(async (req: Request, res: Response) => {


  console.log("hitted uncreated generate qr venue -->> ")
  const result = await VenueService.getCreateGenerateQR();
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Created generate Qr venues data successfully',
    data: result || [],
  });
});

export const venueController = {
  createVenue,
  createVenueByAdmin,
  updateVenue,
  getSpecificVenue,
  getPendingVenues,
  getPopularVenues,
  getSpecificCategoryVenues,
  getAllVenues,
  getAllVenuess,
  getSpecificVenueReviews,
  deleteSpecificVenue,
  acceptedVenueByAdmin,
  deletedVenueByAdmin,
  addVisitorRecord,
  addBookRecord,
  getSpecificVenueStats,
  getDemographicStats,
  getAllLocationVenues,
  getSpecificVenueVisitorStats,
  getSpecificVenueBookingrStats,
  createGenerateQR,
  getMyVenueStatus,
  getSpecificVenueMonthlySummaryWithDemographics,
  getShoppingCategoryVenues,
  getDeletedVenues,
  getUncreatedGenerateQRVenue,
  adminCreateGenerateQR,
  getCreatedGenerateQRVenue,
  blockSpecificVenueByAdmin,
  unBlockSpecificVenueByAdmin
};
