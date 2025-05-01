import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import AppError from '../../error/AppError';
import httpStatus from "http-status"; 
import catchAsync from '../../utils/catchAsync';
import Venue from './venue.model';
import sendResponse from '../../utils/sendResponse';

// Set ffmpeg and ffprobe binaries if they're not in the default system PATH
ffmpeg.setFfmpegPath(path.resolve('C:/ffmpeg/bin/ffmpeg.exe'));  // Path to ffmpeg
ffmpeg.setFfprobePath(path.resolve('C:/ffmpeg/bin/ffprobe.exe'));  // Path to ffprobe

export const checkIfVenueAlreadyExists = () => {
  return catchAsync(async (req, res, next) => {
    const { userId } = req.user;  // Destructure userId from the authenticated user's data

    // Check if the user has already created a venue
    const existingVenue = await Venue.findOne({ userId });

    if (existingVenue) {
      // If the venue exists, return a conflict error with a descriptive message
      sendResponse(res, {
        statusCode: httpStatus.CONFLICT,
        success: false,
        message: "A venue has already been created by this user.",
        data: null,
      });
    }

    next();  // Proceed to the next middleware if no venue exists
  });
};

export function calculateCompletionPercentage(venue: any): number {
    // Define the required fields
    const requiredFields = [
      'name', 'phone', 'category', 'websiteUrl', 'country', 
      'cityTown', 'postalAddress', 'description', 'photos', 
      'videos', 'adminVerified'
    ];
  
    let completedFields = 0;
  
    // Check each required field for completion
    requiredFields.forEach(field => {
      // For arrays like photos and videos, check if they have at least one entry
      if (field === 'photos' || field === 'videos') {
        if (venue[field] && venue[field].length > 0) {
          completedFields++;
        }
      }
      // For boolean field adminVerified, check if it's true
      else if (field === 'adminVerified') {
        if (venue[field] === true) {
          completedFields++;
        }
      }
      // For other fields, check if they are non-empty
      else if (venue[field] && venue[field].trim() !== '') {
        completedFields++;
      }
    });
  
    // Calculate the percentage of completed fields
    const completionPercentage = (completedFields / requiredFields.length) * 100;
  
    return completionPercentage;
  }


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