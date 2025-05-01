import AppError from "../../error/AppError";
import RecommentedVideo from "./recommentedVideo.model";


const createRecommentedVideo = async (data: any) => {
    const recommentedVideo = await RecommentedVideo.create(data);
    if (!recommentedVideo) {
      throw new AppError(httpStatus.BAD_REQUEST, 'RecommentedVideo creation failed');
    }
    return recommentedVideo;
  };

export const RecommendedService = {
    createRecommentedVideo
}