import { Router } from 'express';
import auth from '../../middleware/auth';
import { venueController } from './venue.controller';
import parseData from '../../middleware/parseData';
import fileUpload from '../../middleware/fileUpload';
import { checkIfVenueAlreadyExists } from './venue.utils';
const upload = fileUpload('./public/uploads/venue');

export const venueRoutes = Router();

// create venue route by admin
venueRoutes.post(
  '/create',
  auth('user', 'admin'),
  checkIfVenueAlreadyExists(),
  upload.fields([
        { name: 'photos', maxCount: 10 },
        { name: 'video', maxCount: 1 }
    ]),
  parseData(),
  venueController.createVenue,
)

.patch(
  '/accepted/:venueId',
  auth("admin"),
  venueController.acceptedVenueByAdmin
)

.patch(
  '/deleted/:venueId',
  auth('admin'),
  venueController.deletedVenueByAdmin
)

//update venue route by id
.patch(
  '/:venueId/update',
  auth('admin'),
  venueController.updateVenue,
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

.get(
  "/pending",
  auth("admin"),
  venueController.getPendingVenues
)


.get(
  '/popular',
  // auth('user'),
  venueController.getPopularVenues
)

.get(
  "/category/:categoryName",
  venueController.getSpecificCategoryVenues
)

.get(
  "/:venueId",
  venueController.getSpecificVenue
)
