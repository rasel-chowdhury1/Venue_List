import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

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

  // Function to get video duration
export const getVideoDuration = (videoPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        return reject('Error getting video duration');
      }
      const duration = metadata.format.duration as number; // In seconds
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const durationString = `${minutes} min ${seconds} sec`; // Convert to readable format
      resolve(durationString);
    });
  });
};