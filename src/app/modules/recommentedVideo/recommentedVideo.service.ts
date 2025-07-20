import { stat } from "fs";
import AppError from "../../error/AppError";
import Venue from "../venue/venue.model";
import RecommentedVideo from "./recommentedVideo.model";
import httpStatus from 'http-status';

const createRecommentedVideo = async (data: any) => {

    const venue = await Venue.findOne({userId: data.userId})

    data.venueId = venue?._id;
    data.expiryDate = new Date(
        new Date().setMonth(new Date().getMonth() + 1)
      )
      
    const recommentedVideo = await RecommentedVideo.create(data);
    if (!recommentedVideo) {
      throw new AppError(httpStatus.BAD_REQUEST, 'RecommentedVideo creation failed');
    }
    return recommentedVideo;
  };

const createAdminRecommentedVideo = async (data: any) => {
   data.expiryDate = new Date(
        new Date().setMonth(new Date().getMonth() + 1)
      )
    const recommentedVideo = await RecommentedVideo.create(data);
    if (!recommentedVideo) {
      throw new AppError(httpStatus.BAD_REQUEST, 'RecommentedVideo creation failed');
    }
    return recommentedVideo;
  };

const updateRecommentedVideo = async (data: any) => {
   data.expiryDate = new Date(
        new Date().setMonth(new Date().getMonth() + 1)
      )
    const recommentedVideo = await RecommentedVideo.create(data);
    if (!recommentedVideo) {
      throw new AppError(httpStatus.BAD_REQUEST, 'RecommentedVideo creation failed');
    }
    return recommentedVideo;
  };

const updateRecommentedVideoStatus = async (recommentedId: string, status: string) => {

    console.log({recommentedId, status})
   
    const updateRecommentedVideo = await RecommentedVideo.findByIdAndUpdate(recommentedId, {status}, {new: true})

    console.log("update recommented -->>> ", updateRecommentedVideo)
    if (!updateRecommentedVideo) {
      throw new AppError(httpStatus.BAD_REQUEST, 'RecommentedVideo update failed');
    }
    return updateRecommentedVideo;
  };

const getRecomenetedVideos = async () => {
  const recommentedVideo = await RecommentedVideo.find();
    return recommentedVideo || [];
}

const getStatusRecommentedVideos = async (query: any) => {
  const recommentedVideo = await RecommentedVideo.find(query);
    return recommentedVideo || [];
}
  

export const RecommendedService = {
    createRecommentedVideo,
    createAdminRecommentedVideo,
    getRecomenetedVideos,
    getStatusRecommentedVideos,
    updateRecommentedVideoStatus
}