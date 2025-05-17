import { ObjectId } from "mongoose";
import { emitNotification } from "../../../socketIo";
import AppError from "../../error/AppError";
import DiscoverMauritius from "../discoverMauritius/discoverMauritius.model";
import { User } from "../user/user.models";
import { IVenue } from "./venue.interface";
import Venue from "./venue.model";
import httpStatus from "http-status";
import Review from "../review/review.model";
import { getAdminId } from "../../DB/adminStore";

// // Create a new venue
// const createVenue = async (data: Partial<IVenue>) => {
//   const {longitude,latitude, ...rest} = data;

//     if (longitude !== undefined && latitude !== undefined) {
//     console.log("lang-lattitude ==>>> ", longitude,latitude)
//     rest.location = {
//       type: 'Point',
//       coordinates: [parseFloat(longitude), parseFloat(latitude)],
//     };
//     console.log("rest date 2 -->>>>>>>>> ", rest)
//   }

//   const venue = await Venue.create(rest); // Create the venue in the database
//   if (!venue) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Venue creation failed');
//   }

//           await User.findOneAndUpdate(data.userId, {venueCreated: true})

//   const adminUserId = getAdminId();

//   if(adminUserId && data.userId){
//     const notificationData = {
//       userId: data.userId,
//       receiverId: adminUserId,
//       userMsg: "New venue is added",
//       type: "request",
//     } as any;
//     await emitNotification(notificationData)
//   }
  
//   return venue;
// };
const createVenue = async (data: Partial<IVenue>) => {
  const { longitude, latitude, ...restData } = data;

  // Build location if coordinates are provided
  if (longitude !== undefined && latitude !== undefined) {
    const lng = parseFloat(String(longitude));
    const lat = parseFloat(String(latitude));

    if (isNaN(lng) || isNaN(lat)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid longitude or latitude');
    }

    restData.location = {
      type: 'Point',
      coordinates: [lng, lat],
    };
  }

  // Create the venue
  const venue = await Venue.create(restData);
  if (!venue) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Venue creation failed');
  }

  // Update user's venueCreated flag
  if (data.userId) {
    await User.findOneAndUpdate({ _id: data.userId }, { venueCreated: true });
  }

  // Notify admin
  const adminUserId = getAdminId();
  if (adminUserId && data.userId) {
    const notificationData = {
      userId: data.userId,
      receiverId: adminUserId,
      userMsg: "New venue is added",
      type: "request",
    } as any; 
    
    await emitNotification(notificationData);
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


// pending venue accept by admin
const acceptedVenueByAdmin = async (userId: string, venueId: string) => {
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
  if (venue.video && venue.video.length > 0) {
    const videoUrl = venue.video[0]; // Assuming the first video is the main one
    const discoverVenue = new DiscoverMauritius({
      venueId: venue._id,
      venueName: venue.name,
      location: `${venue.cityTown}, ${venue.country}`,
      videoUrl: videoUrl,
      websiteUrl: venue.websiteUrl,
      duration: '10 min', // You can dynamically calculate or fetch the duration
    });

    await discoverVenue.save();
  }


  // Notify the venue owner about the acceptance
  try {
    await emitNotification({
      userId: userId,
      receiverId: venue.userId,
      userMsg: "Your venue has been accepted and is now live.",
      type: "added", // Descriptive notification type
    } as any);
  } catch (error) {
    console.error("Error notifying venue owner:", error);
  }

  // Get all users except the admin and the venue owner
  const excludedUserIds = [userId, venue.userId];
  const usersToNotify = await User.find({ _id: { $nin: excludedUserIds } });

  // Create and send notifications for each user
  const notificationPromises = usersToNotify.map(async (user) => {
    const userMsg = `A new venue "${venue.name}" is now available.`;
    const type = 'info';

    try {
      // Use the emitNotification function to send the notification
      await emitNotification({
        userId: userId,
        receiverId: user._id,
        userMsg,
        type,
      } as any);
    } catch (error) {
      console.error(`Error notifying user ${user._id}:`, error);
    }
  });

  // Wait for all notifications to be sent
  await Promise.all(notificationPromises);

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

// delte venue by admin
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

  // Get reviews for the specific venue, sorted by most recent first
  const reviews = await Review.find({ venueId })
             .sort({ createdAt: -1 }) // Sort by createdAt descending (recent first)
             .populate('userId', 'fullName profileImage');

  return {...venue.toObject(),reviews};
};

// Get request pending venues 
const getPendingVenues = async () => {
  const venues = await Venue.find({status: 'pending', isDeleted: false})

  if (!venues) {
    throw new AppError(httpStatus.NOT_FOUND, 'Venue not found');
  }

  return venues;
}

// const getSpecificCategoryVenues = async (category: any, query: any) => {
//   const venuesQuery = new QueryBuilder(Venue.find({
//     category: category, 
//     status: 'accepted',
//     isDeleted: false
//   }), query)
//     .search(['name','description','category','cityTown','postalAddress'])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const result = await venuesQuery.modelQuery;
//   const meta = await venuesQuery.countTotal();
//   console.log({ meta, result });
//   return { meta, result };
// }

const getSpecificCategoryVenues = async (category: any, query: any) => {
  const aggregationPipeline: any[] = [];

  // Step 1: Build initial match condition
  const matchConditions: any = {
    category: category,
    status: 'accepted',
    isDeleted: false,
  };

  // Step 2: Add search if searchTerm is provided
  if (query?.searchTerm) {
    const searchRegex = new RegExp(query.searchTerm, 'i'); // case-insensitive
    matchConditions.$or = [
      { name: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
    ];
  }

  aggregationPipeline.push({ $match: matchConditions });

  // Step 3: Lookup reviews
  aggregationPipeline.push({
    $lookup: {
      from: 'reviews',
      localField: '_id',
      foreignField: 'venueId',
      as: 'reviews',
    }
  });

  // Step 4: Group to calculate averageRating
  aggregationPipeline.push({
    $group: {
      _id: "$_id",
      name: { $first: "$name" },
      phone: { $first: "$phone" },
      category: { $first: "$category" },
      cityTown: { $first: "$cityTown" },
      postalAddress: { $first: "$postalAddress" },
      description: { $first: "$description" },
      photos: { $first: "$photos" },
      video: { $first: "$video" },
      adminVerified: { $first: "$adminVerified" },
      status: { $first: "$status" },
      acceptedAt: { $first: "$acceptedAt" },
      deletedAt: { $first: "$deletedAt" },
      isDeleted: { $first: "$isDeleted" },
      createdAt: { $first: "$createdAt" },
      updatedAt: { $first: "$updatedAt" },
      averageRating: {
        $avg: {
          $cond: {
            if: { $gt: [{ $size: "$reviews" }, 0] },
            then: { $avg: "$reviews.rating" },
            else: 0
          }
        }
      }
    }
  });

  // Step 5: Sort by average rating
  aggregationPipeline.push({
    $sort: { averageRating: -1 }
  });

  // Step 6: Project final fields
  aggregationPipeline.push({
    $project: {
      venueId: "$_id",
      name: 1,
      phone: 1,
      category: 1,
      cityTown: 1,
      postalAddress: 1,
      photos: 1,
      adminVerified: 1,
      status: 1,
      acceptedAt: 1,
      deletedAt: 1,
      isDeleted: 1,
      createdAt: 1,
      updatedAt: 1,
      averageRating: 1
    }
  });

  // Step 7: Pagination
  if (query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    aggregationPipeline.push(
      { $skip: skip },
      { $limit: limit }
    );
  }

  // Step 8: Execute
  const result = await Venue.aggregate(aggregationPipeline);

  // Step 9: Meta Info
  const countFilter: any = {
    category: category,
    status: 'accepted',
    isDeleted: false,
  };
  
  if (query?.searchTerm) {
    const searchRegex = new RegExp(query.searchTerm, 'i');
    countFilter.$or = [
      { name: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
    ];
  }

  const totalCount = await Venue.countDocuments(countFilter);

  const meta = {
    page: query.page || 1,
    limit: query.limit || 10,
    total: totalCount,
    totalPage: Math.ceil(totalCount / (query.limit || 10))
  };

  console.log({ meta, result });
  return { meta, result };
};



const getPopularVenue = async () => {
  const venues = await Venue.aggregate([
    // Match venues that are 'accepted' and not deleted
    {
      $match: {
        status: 'accepted',
        isDeleted: false
      }
    },
    // Lookup reviews for the venues
    {
      $lookup: {
        from: 'reviews', // This is the name of your Review collection in MongoDB
        localField: '_id', // Field from Venue model
        foreignField: 'venueId', // Field from Review model
        as: 'reviews' // Name of the array where the reviews will be stored
      }
    },
    // Group by category and calculate average rating for each venue in the category
    {
      $group: {
        _id: "$category", // Group by category
        venues: {
          $push: {
            venueId: "$_id",
            name: "$name",
            address:  { $concat: ["$cityTown", ", ", "$country"] }, // Concatenate cityTown and country
            photos: { $arrayElemAt: ["$photos", 0] }, // Get the first element of the photos array
            averageRating: {
              $avg: { $map: { input: "$reviews.rating", as: "rating", in: "$$rating" } }
            }
          }
        }
      }
    },
    // Optionally, you can sort categories by average rating of their venues
    {
      $project: {
        category: "$_id", // Project the category name
        venues: 1, // Include the list of venues
        _id: 0 // Exclude the _id field as it's the category field now
      }
    }
  ]);

  return venues;
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
  getSpecificCategoryVenues,
  getPopularVenue,
  getAllVenues,
  getPendingVenues,
  deleteSpecificVenue,
  acceptedVenueByAdmin,
  deletedVenueByAdmin
};
