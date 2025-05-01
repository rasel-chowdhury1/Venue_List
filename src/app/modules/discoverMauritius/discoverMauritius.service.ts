import DiscoverMauritius from "./discoverMauritius.model";

const getAllDiscoverMauritius = async () => {
    // You can implement a query builder like in your `userService` for pagination, filtering, etc.
    const notifications = await DiscoverMauritius.find({isDeleted: false});
    return notifications;
  };

export const discoverMauritiusService = {
  getAllDiscoverMauritius
}
 