import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import { emitNotification } from '../../../socketIo';
import { getAdminId } from '../../DB/adminStore';
import AppError from '../../error/AppError';
import DiscoverMauritius from '../discoverMauritius/discoverMauritius.model';
import Review from '../review/review.model';
import { User } from '../user/user.models';
import { IVenue } from './venue.interface';
import Venue, { VenueBooking, VenueVisitor } from './venue.model';
import {
  calculateCompletionPercentage,
  createDiscoverMauritiusVideo,
  getDateRange,
  notifyUsersAboutVenueAcceptance,
} from './venue.utils';
import Category from '../category/category.model';
import QueryBuilder from '../../builder/QueryBuilder';
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
  const { longitude, latitude,category, ...restData } = data;

  const isExistCategoryName = await Category.findOne({name: category});

  if(!isExistCategoryName){
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  restData.category = isExistCategoryName._id;
  

  // Build location if coordinates are provided
  if (longitude !== undefined && latitude !== undefined) {
    const lng = parseFloat(String(longitude));
    const lat = parseFloat(String(latitude));

    if (isNaN(lng) || isNaN(lat)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Invalid longitude or latitude',
      );
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

  const adminUserId = getAdminId();

  if (adminUserId && data.userId) {
    const notificationData = {
      userId: data.userId,
      receiverId: adminUserId,
      userMsg: 'New venue is added',
      type: 'request',
    } as any;

    await emitNotification(notificationData);
  }

  return venue;
};

const createVenueByAdmin = async (data: Partial<IVenue>) => {
  const { longitude, latitude, ...rest } = data;

  if (longitude !== undefined && latitude !== undefined) {
    rest.location = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };
  }

  const venue = await Venue.create(rest); // Create the venue in the database

  if (!venue) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Venue creation failed');
  }

  // Add the venue's video to Discover Mauritius
  if (venue.video && venue.video.length > 0) {
    await createDiscoverMauritiusVideo(venue);
  }

  const adminUserId = getAdminId();

  await User.findByIdAndUpdate(
    venue.userId,
    { venueCreated: true, venueCreatedAdmin: true },
    { new: true },
  );

  await notifyUsersAboutVenueAcceptance(
    adminUserId,
    { userId: venue.userId, name: venue.name },
    'Admin created your venue ',
  );

  return venue;
};

// Update venue by ID
// const updateVenueById = async (
//   venueId: string,
//   updateData: Partial<IVenue>,
// ) => {
//   const venue = await Venue.findById(venueId); // Find venue by its ID
//   if (!venue) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Venue not found');
//   }

//   console.log({updateData})

//   const {generateQR, adminVerified, status, createdAdmin,isBlocked,isDeleted,longitude, latitude, ...rest } = updateData;

// if (longitude !== undefined && latitude !== undefined) {
//   rest.location = {
//     type: 'Point',
//     coordinates: [parseFloat(longitude), parseFloat(latitude)], // Correct order
//   };
// }
//   console.log({venueId, rest})
//   // Update the venue fields with new data
  
//   let updatedVenue;
//   try {
//      updatedVenue = await Venue.findByIdAndUpdate(venueId, rest, {
//     new: true,
//   });
//   } catch (error) {
//     console.log(error)
//   }

//   console.log("updated venue ->", updateData)
//   if (!updatedVenue) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update venue');
//   }

  

//   return updatedVenue;
// };

const updateVenueById = async (
  venueId: string,
  updateData: Partial<IVenue>,
) => {
  const venue = await Venue.findById(venueId); // Find venue by its ID
  if (!venue) {
    throw new AppError(httpStatus.NOT_FOUND, 'Venue not found');
  }

  console.log('Received update data:', updateData);

  // Destructure location-related fields and the rest
  const {
    generateQR,
    adminVerified,
    status,
    createdAdmin,
    isBlocked,
    isDeleted,
    longitude,
    latitude,
    ...rest
  } = updateData;
  

  // // Handle location update safely
  // if (longitude !== undefined && latitude !== undefined) {
  //   const lng = parseFloat(longitude as string);
  //   const lat = parseFloat(latitude as string);

  //   // Validate longitude/latitude bounds
  //   if (
  //     isNaN(lng) || isNaN(lat) ||
  //     lng < -180 || lng > 180 ||
  //     lat < -90 || lat > 90
  //   ) {
  //     throw new AppError(httpStatus.BAD_REQUEST, 'Invalid longitude or latitude provided');
  //   }

  //   rest.location = {
  //     type: 'Point',
  //     coordinates: [lng, lat], // 👈 MongoDB format [longitude, latitude]
  //   };
  // }

  console.log('Updating venue with:', { venueId, rest });

  // Update venue
  let updatedVenue;
  try {
    updatedVenue = await Venue.findByIdAndUpdate(venueId, rest, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    console.error('MongoDB error during venue update:', error);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Database error during venue update');
  }

  if (!updatedVenue) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update venue');
  }

  console.log('✅ Updated Venue:', updatedVenue);
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
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Venue has already been accepted',
    );
  }

  // Mark the venue as accepted and admin verified
  venue.adminVerified = true;
  venue.status = 'accepted';

  venue.acceptedAt = new Date() as any;

  // Add the venue's video to Discover Mauritius after acceptance
  if (venue.video && venue.video.length > 0) {
    await createDiscoverMauritiusVideo(venue);
  }

  await notifyUsersAboutVenueAcceptance(
    userId,
    { userId: venue.userId, name: venue.name },
    'Your venue has been accepted and is now live.',
  );

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

  // Save the venue updates to DB
  await venue.save();

  return venue;
};

// add visitor record
const addVisitorRecord = async (venueId: string, userId: string) => {
  const result = await VenueVisitor.create({ venueId, userId });

  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to add visitor record',
    );
  }
  return result;
};

// add booked record
const addBookRecord = async (venueId: string, userId: string) => {
  const result = await VenueBooking.create({ venueId, userId });

  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to add booking record',
    );
  }
  return result;
};

// delte venue by admin
const deletedVenueByAdmin = async (venueId: string) => {
  const venue = await Venue.findById(venueId); // Find venue by its ID
  if (!venue) {
    throw new AppError(httpStatus.NOT_FOUND, 'Venue not found');
  }

  // Check if the venue is already deleted
  if (venue.status === 'deleted') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Venue has already been deleted',
    );
  }

  // Mark the venue as deleted and update its properties
  venue.adminVerified = false;
  venue.status = 'deleted';
  venue.isDeleted = true;
  venue.deletedAt = new Date();

  console.log({venue})

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
    { new: true }, // Return the updated document
  );

  // if (!updatedDiscover) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     'Failed to update DiscoverMauritius entry',
  //   );
  // }

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
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not authorized to delete this venue',
    );
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
    { new: true }, // Return the updated document
  );

  if (!updatedDiscover) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to update DiscoverMauritius entry',
    );
  }

  return deletedVenue;
};

// Block a specific venue by ID
const blockSpecificVenueByAdmin = async (venueId: string) => {
  const venue = await Venue.findById(venueId); // Find venue by its ID
  if (!venue) {
    throw new AppError(httpStatus.NOT_FOUND, 'Venue not found');
  }

  // Check if the venue is already deleted
  if (venue.status === 'blocked') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Venue has already been blocked',
    );
  }

  // Mark the venue as deleted and update its properties
  venue.adminVerified = false;
  venue.status = 'blocked';
  venue.isBlocked = true;
  venue.blockedAt = new Date();


  // Save the updated venue to the database
  const updatedVenue = await venue.save();

  if (!updatedVenue) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to block the venue');
  }

  // Update the DiscoverMauritius entry associated with this venue
  const updatedDiscover = await DiscoverMauritius.findOneAndUpdate(
    { venueId: venue._id },
    {
      isDeleted: true,
    },
    { new: true }, // Return the updated document
  );

  // if (!updatedDiscover) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     'Failed to update DiscoverMauritius entry',
  //   );
  // }

  return updatedVenue;
};

// Block a specific venue by ID
const unBlockSpecificVenueByAdmin = async (venueId: string) => {
  const venue = await Venue.findById(venueId); // Find venue by its ID
  if (!venue) {
    throw new AppError(httpStatus.NOT_FOUND, 'Venue not found');
  }

  // Check if the venue is already deleted
  if (!(venue.status === 'blocked')) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Venue has already not blocked',
    );
  }

  // Mark the venue as deleted and update its properties
  venue.adminVerified = false;
  venue.status = 'accepted';
  venue.isBlocked = false;


  // Save the updated venue to the database
  const updatedVenue = await venue.save();

  if (!updatedVenue) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to unblock the venue');
  }


  return updatedVenue;
};

// Get a my venue
const getMyVenueStatus = async ( userId: string) => {
    
    const venue = await Venue.findOne({userId: userId }).select('profileImage name status');

    console.log("venue--->>>> ",{venue})



    return venue;
};

// Get a specific venue by ID
const getSpecificVenue = async (venueId: string, userId: string) => {
  // const venue = (await Venue.findById(venueId).populate(
  //   'userId',
  //   'email',
  // ))?.populate("category", "name") as any; // Find venue by its ID

  const venue = await Venue.findById(venueId)
  .populate('userId', 'email')
  .populate('category', 'name type') as any;

  if (!venue) {
    throw new AppError(httpStatus.NOT_FOUND, 'Venue not found');
  }

  //added vistor in specefic venue
  VenueVisitor.create({ venueId, userId }).catch((err) => {
    console.error('Failed to create visitor record:', err);
  });

  // Convert to plain object to manipulate
  const venueObj = venue.toObject();

  // Replace userId object with just the email string
  venueObj.userEmail = venueObj.userId?.email || null;
  delete venueObj.userId; // remove original nested userId field

  // Get reviews for the specific venue, sorted by most recent first
  // const reviews = await Review.find({ venueId })
  //   .sort({ createdAt: -1 }) // Sort by createdAt descending (recent first)
  //   .populate('userId', 'fullName profileImage');

  // return { ...venue.toObject(), reviews };

  // Aggregate to get average rating only
  const ratingResult = await Review.aggregate([
    { $match: { venueId: new mongoose.Types.ObjectId(venueId) } },
    { $group: { _id: '$venueId', averageRating: { $avg: '$rating' } } },
  ]);

  venueObj.averageRating =
    ratingResult.length > 0 ? ratingResult[0].averageRating : 0;
  return venueObj;
};

const getSpecificVenueReviews = async (venueId: string) => {
  // Get reviews for the specific venue, sorted by most recent first
  const reviews = await Review.find({ venueId })
    .sort({ createdAt: -1 }) // Sort by createdAt descending (recent first)
    .populate('userId', 'fullName profileImage');

  return reviews;
};

// Get request pending venues
const getPendingVenues = async () => {
  const venues = await Venue.find({ status: 'pending', isDeleted: false });

  if (!venues) {
    throw new AppError(httpStatus.NOT_FOUND, 'Venue not found');
  }

  return venues;
};

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

const getSpecificCategoryVenues = async (categoryId: any, query: any) => {
  const aggregationPipeline: any[] = [];

  // Convert string to ObjectId
  const categoryObjectId = new Types.ObjectId(categoryId);
  console.log({ categoryObjectId });
  // Step 1: Build initial match condition
  const matchConditions: any = {
    category: categoryObjectId,
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
    },
  });

  // Step 4: Group to calculate averageRating
  aggregationPipeline.push({
    $group: {
      _id: '$_id',
      userId: { $first: '$userId' },
      name: { $first: '$name' },
      profileImage: { $first: '$profileImage' },
      websiteUrl: { $first: '$websiteUrl' },
      phone: { $first: '$phone' },
      category: { $first: '$category' },
      cityTown: { $first: '$cityTown' },
      postalAddress: { $first: '$postalAddress' },
      description: { $first: '$description' },
      photos: { $first: '$photos' },
      video: { $first: '$video' },
      adminVerified: { $first: '$adminVerified' },
      status: { $first: '$status' },
      rating: { $first: '$rating' },
      acceptedAt: { $first: '$acceptedAt' },
      deletedAt: { $first: '$deletedAt' },
      isDeleted: { $first: '$isDeleted' },
      createdAt: { $first: '$createdAt' },
      updatedAt: { $first: '$updatedAt' },
      averageRating: {
        $avg: {
          $cond: {
            if: { $gt: [{ $size: '$reviews' }, 0] },
            then: { $avg: '$reviews.rating' },
            else: 0,
          },
        },
      },
    },
  });

  // Step 5: Populate userId (User info)
  aggregationPipeline.push({
    $lookup: {
      from: 'users', // collection name of User
      localField: 'userId',
      foreignField: '_id',
      as: 'user',
    },
  });

  aggregationPipeline.push({
    $unwind: {
      path: '$user',
      preserveNullAndEmptyArrays: true,
    },
  });

  // Step 5: Sort by average rating
  aggregationPipeline.push({
    $sort: { averageRating: -1 },
  });

  // Step 6: Project final fields
  aggregationPipeline.push({
    $project: {
      userId: 1,
      userName: '$user.fullName',
      email: '$user.email',
      profileImage: 1,
      websiteUrl: 1,
      name: 1,
      phone: 1,
      category: 1,
      cityTown: 1,
      postalAddress: 1,
      photos: 1,
      description: 1,
      adminVerified: 1,
      status: 1,
      rating: 1,
      acceptedAt: 1,
      deletedAt: 1,
      isDeleted: 1,
      createdAt: 1,
      updatedAt: 1,
      averageRating: 1,
    },
  });

  // Step 7: Pagination
  if (query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    aggregationPipeline.push({ $skip: skip }, { $limit: limit });
  }

  // Step 8: Execute
  const result = await Venue.aggregate(aggregationPipeline);

  // Step 9: Meta Info
  const countFilter: any = {
    category: categoryId,
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
    totalPage: Math.ceil(totalCount / (query.limit || 10)),
  };

  console.log({ meta, result });
  return { meta, result };
};

const getShoppingCategoryVenues = async (categoryId: any, query: any) => {

  console.log({query})
  const {subcategory, secondarySubcategory} = query;
  // Convert string to ObjectId
  const categoryObjectId = new Types.ObjectId(categoryId);

  // Step 1: Build initial match condition
  const matchConditions: any = {
    category: categoryObjectId,
    status: 'accepted',
    isDeleted: false,
  };

  if(subcategory){
    matchConditions.subcategory = subcategory;
  }
  
  if(secondarySubcategory){
    console.log("exicute this ->> ");
    matchConditions.secondarySubcategory = secondarySubcategory;
  }

  console.log({matchConditions})

  const result = await Venue.find(matchConditions) 

  return result;
}

const getPopularVenue = async () => {
  const venues = await Venue.aggregate([
    // Match venues that are 'accepted' and not deleted
    {
      $match: {
        status: 'accepted',
        isDeleted: false,
      },
    },
    // Lookup reviews for the venues
    {
      $lookup: {
        from: 'reviews', // This is the name of your Review collection in MongoDB
        localField: '_id', // Field from Venue model
        foreignField: 'venueId', // Field from Review model
        as: 'reviews', // Name of the array where the reviews will be stored
      },
    },
    // Group by category and calculate average rating for each venue in the category
    {
      $group: {
        _id: '$category', // Group by category
        venues: {
          $push: {
            venueId: '$_id',
            name: '$name',
            address: { $concat: ['$cityTown', ', ', '$country'] }, // Concatenate cityTown and country
            photos: { $arrayElemAt: ['$photos', 0] }, // Get the first element of the photos array
            averageRating: {
              $avg: {
                $map: {
                  input: '$reviews.rating',
                  as: 'rating',
                  in: '$$rating',
                },
              },
            },
          },
        },
      },
    },
    // Optionally, you can sort categories by average rating of their venues
    {
      $project: {
        category: '$_id', // Project the category name
        venues: 1, // Include the list of venues
        _id: 0, // Exclude the _id field as it's the category field now
      },
    },
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

// Get all venues
const getAllVenuess = async (query: any) => {
  const venueQuery = new QueryBuilder(Venue.find({adminVerified: true}), query)
    .search(['name', 'location']) // example searchable fields
    .filter()                     // applies query filtering
    .sort('createdAt')            // sort by createdAt
    .paginate()                   // supports limit & skip
    .fields();                    // fields selection

  const result = await venueQuery.modelQuery;
  const meta = await venueQuery.countTotal();
  return { meta, result };
};


// Get all venues
const getDeletedVenues = async (query: any) => {
  const venueQuery = new QueryBuilder(Venue.find({isDeleted: true}), query)
    .search(['name', 'location']) // example searchable fields
    .filter()                     // applies query filtering
    .sort('createdAt')            // sort by createdAt
    .paginate()                   // supports limit & skip
    .fields();                    // fields selection

  const result = await venueQuery.modelQuery;
  const meta = await venueQuery.countTotal();
  return { meta, result };
};

//get all location of venue
const getAllLocationVenues = async () => {
  const venues = await Venue.find({isDeleted: false, isBlocked: false, status: "accepted"}).select("location profileImage name postalAddress").populate("category", "name").lean(); // Get all venues from the database
  if (venues.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No venues found');
  }
  return venues;
};

const getSpecificVenueStats = async (userId: string) => {

  const existingVenue = await Venue.findOne({userId});
  if(!existingVenue) {
    throw new AppError(httpStatus.NOT_FOUND, 'No venues found');
  }
  const venue = await Venue.findById(existingVenue._id);
  if (!venue) {
    throw new AppError(httpStatus.NOT_FOUND, 'No venues found');
  }

  // Count visitors and bookings for the specific venue
  const [visitorsCount, bookingsCount] = await Promise.all([
    VenueVisitor.countDocuments({ venueId: venue._id }),
    VenueBooking.countDocuments({ venueId: venue._id }),
  ]);

  // Calculate margin
  const margin = visitorsCount > 0 ? (bookingsCount / visitorsCount) * 100 : 0;

  const verificationStatus = calculateCompletionPercentage(venue);

  console.log('verification status ->>> ', { verificationStatus });

  return {
    venue: venue._id,
    visitorsCount,
    bookingsCount,
    margin: Math.round(margin),
    profileCompletion: verificationStatus
  };
};

const getSpecificVenueMonthlySummaryWithDemographics = async (userId: string) => {
  const existingVenue = await Venue.findOne({ userId });
  if (!existingVenue) {
    throw new AppError(httpStatus.NOT_FOUND, 'No venues found');
  }

  const venueId = existingVenue._id;

  // Get the current month's start and end dates
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Count monthly visitors and bookings
  const [visitorsCount, bookingsCount, genderStats] = await Promise.all([
    VenueVisitor.countDocuments({
      venueId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    }),
    VenueBooking.countDocuments({
      venueId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    }),
    VenueVisitor.aggregate([
      {
        $match: {
          venueId: new mongoose.Types.ObjectId(venueId),
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.gender',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const totalGender = genderStats.reduce((acc, g) => acc + g.count, 0) || 1;

  const genderBreakdown = genderStats.map((g) => ({
    gender: g._id,
    count: g.count,
    percent: Math.round((g.count / totalGender) * 100),
  }));

  const margin = visitorsCount > 0 ? (bookingsCount / visitorsCount) * 100 : 0;

  return {
    venueId,
    month: `${startOfMonth.toLocaleString('default', {
      month: 'long',
    })} ${startOfMonth.getFullYear()}`,
    visitorsCount,
    bookingsCount,
    margin: Math.round(margin),
    genderBreakdown,
  };
};

const getDemographicStats = async (userId: string) => {
  const existingVenue = await Venue.findOne({ userId });
  console.log({ existingVenue });

  if (!existingVenue) {
    throw new AppError(httpStatus.NOT_FOUND, 'No venues found');
  }

  const now = new Date();

  const stats = await VenueVisitor.aggregate([
    { $match: { venueId: existingVenue._id } },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $addFields: {
        age: {
          $divide: [
            { $subtract: [now, '$user.dateOfBirth'] },
            1000 * 60 * 60 * 24 * 365, // convert ms to years
          ],
        },
      },
    },
    {
      $facet: {
        ageGroups: [
          {
            $bucket: {
              groupBy: '$age',
              boundaries: [11,16,21,26, 31, 36, 41, 46, 51, 56, 101], // custom boundaries for age ranges
              default: 'Other',
              output: { count: { $sum: 1 } },
            },
          },
        ],
        genderBreakdown: [
          {
            $group: {
              _id: '$user.gender',
              count: { $sum: 1 },
            },
          },
        ],
        locationBreakdown: [
          {
            $group: {
              _id: '$user.country',
              count: { $sum: 1 },
            },
          },
        ],
        total: [{ $count: 'total' }],
      },
    },
  ]);

  const result = stats[0];
  const total = result.total[0]?.total || 1; // avoid division by zero

  const percentage = (count: number) => Math.round((count / total) * 100);

  return {
    ageGroups: result.ageGroups.map((g) => ({
      range: `${g._id}-${g._id + 4}`, // Display age range as "25-30", "31-35", etc.
      percent: percentage(g.count),
    })),
    genderBreakdown: result.genderBreakdown.map((g) => ({
      gender: g._id,
      percent: percentage(g.count),
    })),
    locationBreakdown: result.locationBreakdown.map((l) => ({
      location: l._id,
      percent: percentage(l.count),
    })),
  };
};




const getSpecificVenueVisitorStats = async (userId, rangeType) => {
  const existingVenue = await Venue.findOne({ userId });
  if (!existingVenue) {
    throw new AppError(httpStatus.NOT_FOUND, 'No venues found');
  }

   const totalVisitors = await VenueVisitor.find({venueId: existingVenue._id}).countDocuments() || 0; 
  const { startDate, endDate } = getDateRange(rangeType);

  const stats = await VenueVisitor.aggregate([
    { $match: { venueId: existingVenue._id, visitedAt: { $gte: startDate, $lt: endDate } } },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $group: {
        _id: rangeType === 'week' ? { $dayOfWeek: '$visitedAt' } : { $month: '$visitedAt' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        '_id': 1, // Sort by the day of the week (1-7) or month (1-12)
      },
    },
  ]);

  // Create empty array for the full range of days or months
  const result = rangeType === 'week'
    ? [
        { name: 'Sun', visitors: 0 },
        { name: 'Mon', visitors: 0 },
        { name: 'Tue', visitors: 0 },
        { name: 'Wed', visitors: 0 },
        { name: 'Thu', visitors: 0 },
        { name: 'Fri', visitors: 0 },
        { name: 'Sat', visitors: 0 }
      ]
    : [
        { name: 'Jan', visitors: 0 },
        { name: 'Feb', visitors: 0 },
        { name: 'Mar', visitors: 0 },
        { name: 'Apr', visitors: 0 },
        { name: 'May', visitors: 0 },
        { name: 'June', visitors: 0 },
        { name: 'July', visitors: 0 },
        { name: 'Aug', visitors: 0 },
        { name: 'Sep', visitors: 0 },
        { name: 'Oct', visitors: 0 },
        { name: 'Nov', visitors: 0 },
        { name: 'Dec', visitors: 0 }
      ];

  // Format the result based on rangeType (week or month)
  stats.forEach((entry) => {
    if (rangeType === 'week') {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      result[entry._id - 1].visitors = entry.count; // Set visitors count for the correct day
    } else if (rangeType === 'month') {
      result[entry._id - 1].visitors = entry.count; // Set visitors count for the correct month
    }
  });

  console.log({result})
  return {
    totalVisitors,
    data: result,
  };
};



const getSpecificBookingVisitorStats = async (userId, rangeType) => {
  const existingVenue = await Venue.findOne({ userId });
  if (!existingVenue) {
    throw new AppError(httpStatus.NOT_FOUND, 'No venues found');
  }
  
  

  const { startDate, endDate } = getDateRange(rangeType);

  const stats = await VenueBooking.aggregate([
    { $match: { venueId: existingVenue._id, visitedAt: { $gte: startDate, $lt: endDate } } },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $group: {
        _id: rangeType === 'week' ? { $dayOfWeek: '$visitedAt' } : { $month: '$visitedAt' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        '_id': 1, // Sort by the day of the week (1-7) or month (1-12)
      },
    },
  ]);

  // Create empty array for the full range of days or months
  const result = rangeType === 'week'
    ? [
        { name: 'Sun', visitors: 0 },
        { name: 'Mon', visitors: 0 },
        { name: 'Tue', visitors: 0 },
        { name: 'Wed', visitors: 0 },
        { name: 'Thu', visitors: 0 },
        { name: 'Fri', visitors: 0 },
        { name: 'Sat', visitors: 0 }
      ]
    : [
        { name: 'Jan', visitors: 0 },
        { name: 'Feb', visitors: 0 },
        { name: 'Mar', visitors: 0 },
        { name: 'Apr', visitors: 0 },
        { name: 'May', visitors: 0 },
        { name: 'June', visitors: 0 },
        { name: 'July', visitors: 0 },
        { name: 'Aug', visitors: 0 },
        { name: 'Sep', visitors: 0 },
        { name: 'Oct', visitors: 0 },
        { name: 'Nov', visitors: 0 },
        { name: 'Dec', visitors: 0 }
      ];

  // Format the result based on rangeType (week or month)
  stats.forEach((entry) => {
    if (rangeType === 'week') {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      result[entry._id - 1].visitors = entry.count; // Set visitors count for the correct day
    } else if (rangeType === 'month') {
      result[entry._id - 1].visitors = entry.count; // Set visitors count for the correct month
    }
  });

  return result;
};

// add visitor record
const createGenerateQR = async (userId: string) => {
  const existingVenue = await Venue.findOne({userId});
  if(!existingVenue) {
    throw new AppError(httpStatus.NOT_FOUND, 'No venues found');
  }
  const result = await Venue.findByIdAndUpdate(existingVenue._id, {"generateQR": true}, {new: true})

  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to generate qr ',
    );
  }
  return result;
};

const adminGenerateQR = async (venueId: string) => {
  const result = await Venue.findByIdAndUpdate(
    venueId,
    { generateQR: true },
    { new: true }
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Venue not found or failed to update.');
  }

  return result;
};


// add visitor record
const getUnCreateGenerateQR = async () => {
  const result = await Venue.find({ generateQR: false }).populate('userId', 'fullName').select("name generateQR");
  
  console.log("result -->> ", {result})

  return result;
};

// add visitor record
const getCreateGenerateQR = async () => {
  const result = await Venue.find({ generateQR: true }).populate('userId', 'fullName').select("name generateQR");
  
  console.log("result -->> ", {result})

  return result;
};

export const VenueService = {
  createVenue,
  createVenueByAdmin,
  createGenerateQR,
  updateVenueById,
  adminGenerateQR,
  
  acceptedVenueByAdmin,
  addVisitorRecord,
  addBookRecord,
  deleteSpecificVenue,
  deletedVenueByAdmin,

  
  getSpecificVenueStats,
  getDemographicStats,
  getAllLocationVenues,
  getSpecificVenueVisitorStats,
  getSpecificBookingVisitorStats,
  getMyVenueStatus,
  getSpecificVenue,
  getSpecificCategoryVenues,
  getPopularVenue,
  getAllVenues,
  getAllVenuess,
  getSpecificVenueMonthlySummaryWithDemographics,
  getShoppingCategoryVenues,
  getPendingVenues,
  getSpecificVenueReviews,
  getDeletedVenues,
  getUnCreateGenerateQR,
  getCreateGenerateQR,
  blockSpecificVenueByAdmin,
  unBlockSpecificVenueByAdmin
};
