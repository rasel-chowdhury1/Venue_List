import AppError from "../../error/AppError";
import DiscoverMauritius from "./discoverMauritius.model";


const createAdminDiscoverMauritiusVideo = async (data: any) => {
    const discoverMauritius = await DiscoverMauritius.create(data);
    if (!discoverMauritius) {
      throw new AppError(httpStatus.BAD_REQUEST, 'DiscoverMauritius creation failed');
    }
    return discoverMauritius;
};
  
const updateAdminDiscoverMauritiusVideo = async (discoverId:string, data: any) => {
  // const discoverMauritius = await DiscoverMauritius.create(data);
  const discoverMauritius = await DiscoverMauritius.findByIdAndUpdate(discoverId, data, {new: true})
    if (!discoverMauritius) {
      throw new AppError(httpStatus.BAD_REQUEST, 'DiscoverMauritius update failed');
    }
    return discoverMauritius;
};
  
const deleteAdminDiscoverMauritiusVideo = async (discoverId:string) => {
  // const discoverMauritius = await DiscoverMauritius.create(data);
  const discoverMauritius = await DiscoverMauritius.findByIdAndUpdate(discoverId, {isDeleted: true}, {new: true})
    if (!discoverMauritius) {
      throw new AppError(httpStatus.BAD_REQUEST, 'DiscoverMauritius deleted failed');
    }
    return discoverMauritius;
  };

const getAllDiscoverMauritius = async () => {
    // You can implement a query builder like in your `userService` for pagination, filtering, etc.
    const notifications = await DiscoverMauritius.find({isDeleted: false}).populate("venueId", "name postalAddress websiteUrl profileImage ");
    return notifications;
  };



export const discoverMauritiusService = {
  getAllDiscoverMauritius,
  updateAdminDiscoverMauritiusVideo,
  createAdminDiscoverMauritiusVideo,
  deleteAdminDiscoverMauritiusVideo
}
 