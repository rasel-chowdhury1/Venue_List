import AppError from "../../error/AppError";
import LiveInMauritius from "./liveInMauritius.model";


const createAdminLiveInMauritiusVideo = async (data: any) => {
    const liveInMauritius= await LiveInMauritius.create(data);
    if (!liveInMauritius) {
      throw new AppError(httpStatus.BAD_REQUEST, 'DiscoverMauritius creation failed');
    }
    return liveInMauritius;
  };

const getAllLiveInMauritius = async () => {
    // You can implement a query builder like in your `userService` for pagination, filtering, etc.
    const notifications = await LiveInMauritius.find().populate("venueId", "name postalAddress websiteUrl profileImage");
    return notifications;
  };



export const liveInMauritiusService = {
  getAllLiveInMauritius,
  createAdminLiveInMauritiusVideo
}
 