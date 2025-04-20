import AppError from "../../error/AppError";
import DiscoverMauritius from "../discoverMauritius/discoverMauritius.model";
import { IVenue } from "./venue.interface";
import Venue from "./venue.model";
import httpStatus from "http-status";

// Create a new venue
const createVenue = async (data: Partial<IVenue>) => {
  const venue = await Venue.create(data); // Create the venue in the database
  if (!venue) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Venue creation failed');
  }
  return venue;
};

// Update venue by ID
const updateVenueById = async (venueId: string, updateData: Partial<IVenue>) => {
  const venue = await Venue.findById(venueId); // Find venue by its ID
  if (!venue) {
    throw new AppError(httpStatus.NOT_FOUND, 'Venue not found');
  }

  // Update the venue fields with new data
  const updatedVenue = await Venue.findByIdAndUpdate(venueId, updateData, { new: true });
  if (!updatedVenue) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update venue');
  }

  return updatedVenue;
};

const acceptedVenueByAdmin = async (venueId: string) => {
  const venue = await Venue.findById(venueId); // Find venue by its ID
  if (!venue) {
    throw new AppError(httpStatus.NOT_FOUND, 'Venue not found');
  }

  // Check if the venue is already accepted
  if (venue.status === 'accepted') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Venue has already been accepted');
  }

  // Mark the venue as accepted and admin verified
  venue.adminVerified = true;
  venue.status = 'accepted';
  venue.acceptedAt = new Date() as any;

  // Add the venue's video to Discover Mauritius after acceptance
  if (venue.videos && venue.videos.length > 0) {
    const videoUrl = venue.videos[0]; // Assuming the first video is the main one
    const discoverVenue = new DiscoverMauritius({
      venueId: venue._id,
      venueName: venue.name,
      location: `${venue.cityTown}, ${venue.country}`,
      videoUrl: videoUrl,
      duration: '10 min', // You can dynamically calculate or fetch the duration
      isDeleted: true
    });

    await discoverVenue.save();
  }

  // // Get video duration dynamically
  // try {
  //   const videoDuration = await getVideoDuration(videoUrl); // Fetch video duration

  //   const discoverVenue = new DiscoverMauritius({
  //     venueId: venue._id,
  //     venueName: venue.name,
  //     location: `${venue.cityTown}, ${venue.country}`,
  //     videoUrl: videoUrl,
  //     duration: videoDuration, // Store the dynamically fetched duration

  //   });

  //   await discoverVenue.save();
  // } catch (error) {
  //   console.error('Error fetching video duration:', error);
  // }

  return venue;
};


const deletedVenueByAdmin = async (venueId: string) => {
  const venue = await Venue.findById(venueId); // Find venue by its ID
  if (!venue) {
    throw new AppError(httpStatus.NOT_FOUND, 'Venue not found');
  }

  // Check if the venue is already deleted
  if (venue.status === 'deleted') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Venue has already been deleted');
  }

  // Mark the venue as deleted and update its properties
  venue.adminVerified = false;
  venue.status = 'deleted';
  venue.deletedAt = new Date();

  // Save the updated venue to the database
  const updatedVenue = await venue.save();

  if (!updatedVenue) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete the venue');
  }

    // Update the DiscoverMauritius entry associated with this venue
    const updatedDiscover = await DiscoverMauritius.findOneAndUpdate(
      { venueId: venue._id },
      { 
        isDeleted: true,
      },
      { new: true } // Return the updated document
    );
  
    if (!updatedDiscover) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update DiscoverMauritius entry');
    }

  return updatedVenue;
};

// Delete a specific venue by ID
const deleteSpecificVenue = async (userId: string, venueId: string) => {
  const venue = await Venue.findById(venueId); // Find the venue by its ID
  if (!venue) {
    throw new AppError(httpStatus.NOT_FOUND, 'Venue not found');
  }

  // Check if the user is authorized to delete the venue
  if (venue.userId.toString() !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to delete this venue');
  }

  // Mark the venue as deleted and save the changes
  venue.isDeleted = true;

  const deletedVenue = await venue.save(); // Save the venue with updated deletion status
  if (!deletedVenue) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete venue');
  }

   // Update the DiscoverMauritius entry associated with this venue
   const updatedDiscover = await DiscoverMauritius.findOneAndUpdate(
    { venueId: venue._id },
    { 
      isDeleted: true,
    },
    { new: true } // Return the updated document
  );

  if (!updatedDiscover) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update DiscoverMauritius entry');
  }

  return deletedVenue;
};


// Get a specific venue by ID
const getSpecificVenue = async (venueId: string) => {
  const venue = await Venue.findById(venueId); // Find venue by its ID
  if (!venue) {
    throw new AppError(httpStatus.NOT_FOUND, 'Venue not found');
  }
  return venue;
};

// Get all venues
const getAllVenues = async () => {
  const venues = await Venue.find(); // Get all venues from the database
  if (venues.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No venues found');
  }
  return venues;
};

export const VenueService = {
  createVenue,
  updateVenueById,
  getSpecificVenue,
  getAllVenues,
  deleteSpecificVenue,
  acceptedVenueByAdmin,
  deletedVenueByAdmin
};
