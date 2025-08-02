import { Router } from 'express';
import auth from '../../middleware/auth';
import fileUpload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import { venueController } from './venue.controller';
import { checkIfVenueAlreadyExists } from './venue.utils';
const upload = fileUpload('./public/uploads/venue');

export const venueRoutes = Router();

// create venue route by user
venueRoutes.post(
  '/create',
  auth('user', 'admin'),
  checkIfVenueAlreadyExists(),
  upload.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'photos', maxCount: 10 },
    { name: 'video', maxCount: 1 },
    { name: 'menuPhotos', maxCount: 5 },
  ]),
  parseData(),
  venueController.createVenue,
)

// create venue route by admin
  .post(
    '/admin/create',
    auth('admin'),
    upload.fields([
      { name: 'profile', maxCount: 1 },
      { name: 'photos', maxCount: 10 },
      { name: 'video', maxCount: 1 },
      { name: 'menuPhotos', maxCount: 5 },
    ]),
    parseData(),
    venueController.createVenueByAdmin,
  ) 

  .post(
    '/:venueId/visit',
    auth('user', 'admin'),
    venueController.addVisitorRecord,
  )

  .post(
    '/:venueId/book', 
    auth('user', 'admin'), 
    venueController.addBookRecord
)
  
    .post(
    '/generateQr',
    auth("admin"),
    venueController.adminCreateGenerateQR
  )

  .patch(
    '/generateQr',
    auth("user"),
    venueController.createGenerateQR
)
  
  

  .patch(
    '/accepted/:venueId',
    auth('admin'),
    venueController.acceptedVenueByAdmin,
  )

  .patch(
    '/deleted/:venueId',
    auth('admin'),
    venueController.deletedVenueByAdmin,
)
  // block venue by id
    .patch(
    '/blocked/:venueId',
    auth('admin'),
      venueController.blockSpecificVenueByAdmin,
)
  // unblock venue by id
  .patch(
    '/unblocked/:venueId',
    auth('admin'),
    venueController.unBlockSpecificVenueByAdmin,
  )

  //update venue route by id
  .patch(
    '/:venueId/update', 
    auth("user",'admin'), 
    upload.fields([
      { name: 'profile', maxCount: 1 },
      { name: 'photos', maxCount: 10 },
      { name: 'menuPhotos', maxCount: 5 },
    ]),
    parseData(),
    venueController.updateVenue
)
  
  // block venue route by id
  .delete(
    '/block/:venueId',
    auth('admin'),
    venueController.deleteSpecificVenue,
  )

  // delete venue route by id
  .delete(
    '/:venueId/delete',
    auth('admin'),
    venueController.deleteSpecificVenue,
  )

  // get all venue by admin
  .get(
    '/',
    // auth('user'),
    venueController.getAllVenues,
  )

    // get all venue by admin
  .get(
    '/all',
    // auth('user'),
    venueController.getAllVenuess,
)
  
  // get all uncreated QR code venue
  .get(
    '/unGenerateQr',
    venueController.getUncreatedGenerateQRVenue
)
  
  
  // get all uncreated QR code venue
  .get(
    '/generateQr',
    venueController.getCreatedGenerateQRVenue
  )


      // get deleted venue by admin
  .get(
    '/deleted',
    // auth('user'),
    venueController.getDeletedVenues,
  )
  
  .get(
    "/report",
    auth("user"),
    venueController.getSpecificVenueMonthlySummaryWithDemographics
  )

  .get(
    "/location",
     venueController.getAllLocationVenues
  )

  .get(
    '/pending', 
    auth('admin'), 
    venueController.getPendingVenues
  )

  .get(
    '/popular',
    // auth('user'),
    venueController.getPopularVenues,
  )

  .get(
    '/category/:categoryId', 
    venueController.getSpecificCategoryVenues
  )

  .get(
    "/category/:categoryId/shopping", 
    venueController.getShoppingCategoryVenues
  )

  .get(
    '/reviews/:venueId', 
    venueController.getSpecificVenueReviews
  )

  .get(
    '/stats',
    auth('user', 'admin'),
    venueController.getSpecificVenueStats,
  )

  .get(
    "/visitor-stats",
    auth("user", "admin"),
    venueController.getSpecificVenueVisitorStats
  )

  .get(
    "/booking-stats",
    auth("user", "admin"),
    venueController.getSpecificVenueBookingrStats
  )
  
  .get(
    '/demographics',
    auth('user', 'admin'),
    venueController.getDemographicStats,
  )



  .get(
    '/getMyVenueStatus', 
    auth('user', 'admin'), 
    venueController.getMyVenueStatus
  )

  .get(
    '/:venueId', 
    // auth('user', 'admin'), 
    venueController.getSpecificVenue
  )
