import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import AppError from '../../error/AppError';
import httpStatus from "http-status"; 
import catchAsync from '../../utils/catchAsync';
import Venue from './venue.model';
import sendResponse from '../../utils/sendResponse';
import { User } from '../user/user.models';
import { send } from 'process';
import { IVenue } from './venue.interface';
import DiscoverMauritius from '../discoverMauritius/discoverMauritius.model';
import { emitNotification } from '../../../socketIo';

// Set ffmpeg and ffprobe binaries if they're not in the default system PATH
ffmpeg.setFfmpegPath(path.resolve('C:/ffmpeg/bin/ffmpeg.exe'));  // Path to ffmpeg
ffmpeg.setFfprobePath(path.resolve('C:/ffmpeg/bin/ffprobe.exe'));  // Path to ffprobe

export const checkIfVenueAlreadyExists = () => {
  return catchAsync(async (req, res, next) => {
    const { userId } = req.user;  // Destructure userId from the authenticated user's data

    const existUser = await User.findById(userId);


    console.log({existUser})
    // if (!existUser || existUser.isSubcription === "none" || existUser.isSubcription ==="expired") {
    //   return sendResponse(res, {
    //     statusCode: httpStatus.CONFLICT,
    //     success: false,
    //     message: "User does not exist or does not have an active subscription.",
    //     data: null,
    //   });
    // }

      if (!existUser) {
      return sendResponse(res, {
        statusCode: httpStatus.CONFLICT,
        success: false,
        message: "User does not exist or does not have an active subscription.",
        data: null,
      });
    }



    // Check if the user has already created a venue
    const existingVenue = await Venue.findOne({ userId });

    console.log({existingVenue})

    if (existingVenue) {
      // If the venue exists, return a conflict error with a descriptive message

      console.log("something went wrong-->>>> ")
      return sendResponse(res, {
        statusCode: httpStatus.CONFLICT,
        success: false,
        message: "You have already created a venue. Only one venue per user is allowed.",
        data: null,
      });
    }

    next();  // Proceed to the next middleware if no venue exists
  });
};


export const createDiscoverMauritiusVideo = async (venue: IVenue) => {
   const discoverVenue = new DiscoverMauritius({
      userId: venue.userId,
      venueId: venue._id,
      venueName: venue.name,
      location: `${venue.cityTown}, ${venue.country}`,
      videoUrl: venue.video![0],
      websiteUrl: venue.websiteUrl,
      duration: '10 min', // You can dynamically calculate or fetch the duration
    });

    await discoverVenue.save();
}

export async function notifyUsersAboutVenueAcceptance(
  actingUserId: string,
  venue: { userId: any; name: string },
  message: string
) {
  // Notify the venue owner
  try {
    await emitNotification({
      userId: actingUserId,
      receiverId: venue.userId,
      userMsg: message,
      type: "added",
    } as any);
  } catch (error) {
    console.error("Error notifying venue owner:", error);
  }

  // Get all users except the admin and venue owner
  const excludedUserIds = [actingUserId, venue.userId];
  let usersToNotify;
  try {
    usersToNotify = await User.find({ _id: { $nin: excludedUserIds } });
  } catch (error) {
    console.error("Error fetching users for notification:", error);
    return;
  }

  // Notify other users about the new venue
  const notificationPromises = usersToNotify.map(async (user) => {
    try {
      await emitNotification({
        userId: actingUserId,
        receiverId: user._id,
        userMsg: `A new venue "${venue.name}" is now available.`,
        type: "info",
      } as any);
    } catch (error) {
      console.error(`Error notifying user ${user._id}:`, error);
    }
  });

  await Promise.all(notificationPromises);
}
export function calculateCompletionPercentage(venue: any): any {
  // Define the required fields
  const requiredFields = ["profileImage", "photos", "description", "generateQR"];

  const profileCompletion = [] as any;
  let completedFields = 0;

  // Check each required field for completion
  requiredFields.forEach(field => {
    if (field === "profileImage") {
      if (venue[field]) {
        completedFields++;
        profileCompletion.push({ "profileImage": "completed" });
      } else {
        profileCompletion.push({ "profileImage": "unCompleted" });
      }
    }

    else if (field === "photos") {
      if (venue[field] && venue[field].length > 0) {
        completedFields++;
        profileCompletion.push({ "photos": "completed" });
      } else {
        profileCompletion.push({ "photos": "unCompleted" });
      }
    }

    else if (field === "description") {
      if (venue[field]) {
        completedFields++;
        profileCompletion.push({ "description": "completed" });
      } else {
        profileCompletion.push({ "description": "unCompleted" });
      }
    }

    else if (field === "generateQR") {
      if (venue[field]) {
        completedFields++;
        profileCompletion.push({ "generateQR": "completed" });
      } else {
        profileCompletion.push({ "generateQR": "unCompleted" });
      }
    }
  });

  // Calculate the percentage of completed fields
  const completionPercentage = (completedFields / requiredFields.length) * 100;

  console.log(profileCompletion);
  return {percentage: completionPercentage, completation: profileCompletion};
}



// Helper function to calculate date range for week, month, or year
export const getDateRange = (rangeType: "week" | "month" | "year" ) => {
  const now = new Date();
  let startDate, endDate;

  switch (rangeType) {
    case 'week':
      // Get start of the current week (Sunday)
      startDate = new Date(now.setDate(now.getDate() - now.getDay()));
      startDate.setHours(0, 0, 0, 0);
      // End of the current week (Saturday)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
      // Start of this month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      // End of this month
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    // case 'year':
    //   // Start of this year
    //   startDate = new Date(now.getFullYear(), 0, 1);
    //   // End of this year
    //   endDate = new Date(now.getFullYear() + 1, 0, 0);
    //   endDate.setHours(23, 59, 59, 999);
    //   break;
    default:
      throw new Error('Invalid range type');
  }

  return { startDate, endDate };
};

// export function calculateCompletionPercentage(venue: any): number {

//     // Define the required fields
//     const requiredFields = [
//       "profileImage", "photos", "description", "generateQR"
//     ];

//     const profileCompletion = [] as any;
  
//     let completedFields = 0;
  
//     // Check each required field for completion
//     requiredFields.forEach(field => {
//       // For arrays like photos and videos, check if they have at least one entry
//        if ( field === "profileImage"){
//         if(venue[field]){
//           completedFields++;
//           profileCompletion.push({"profileImage": "completed"})
//         }
//         profileCompletion.push({"profileImage": "unCompleted"})
//       }
//       else if (field === 'photos' ) {
//         if (venue[field] && venue[field].length > 0) {
//           completedFields++;
//           profileCompletion.push({"photos": "completed"})
//         }
//         else{profileCompletion.push({"photos": "notCompleted"})}
//       }

//       else if ( field === "description"){
//         if(venue[field]){
//           completedFields++;
//           profileCompletion.push({"description": "completed"})
//         }
//         profileCompletion.push({"description": "unCompleted"})
//       }

      
//       else if ( field === "generateQR"){
//         if(venue[field]){
//           completedFields++;
//           profileCompletion.push({"generateQR": "completed"})
//         }
//         profileCompletion.push({"generateQR": "unCompleted"})
//       }
//       // For boolean field adminVerified, check if it's true
//       // else if (field === 'adminVerified') {
//       //   if (venue[field] === true) {
//       //     completedFields++;
//       //   }
//       // }
//       // For other fields, check if they are non-empty
//       // else if (venue[field] && venue[field].trim() !== '') {
//       //   completedFields++;
//       // }
//     });
  
//     // Calculate the percentage of completed fields
//     const completionPercentage = (completedFields / requiredFields.length) * 100;

//     console.log(profileCompletion)
//     return completionPercentage;
//   }


//getVideoDuration
export const getVideoDuration = (filePath: string): Promise<number | undefined> => {
  console.log("path -->>> ", filePath)
  return new Promise((resolve, reject) => {
    const normalizedPath = path.resolve(filePath).replace(/\\/g, '/');
    console.log('FFmpeg Path:', normalizedPath); // Log the final path used
 
    ffmpeg.ffprobe(normalizedPath, (err, metadata) => {
      if (err) {
        //console.error('FFmpeg Error:', err.message);
        throw new AppError(httpStatus.NOT_FOUND, 'FFmpeg Error');
      }
      const duration = metadata.format.duration; // Duration in seconds
      resolve(duration);
    });
  });
};


