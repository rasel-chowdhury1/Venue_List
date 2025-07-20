import httpStatus from 'http-status';
import RecoveryRequest from './recoveryRequest.model';
import { IRecoveryRequest } from './recoveryRequest.interface';
import AppError from '../../error/AppError';
import Venue from '../venue/venue.model';
import { ObjectId } from 'mongoose';
import { User } from '../user/user.models';
import QueryBuilder from '../../builder/QueryBuilder';

// Create a new recovery request
const createRecoveryRequest = async (
  payload: Partial<IRecoveryRequest>
): Promise<IRecoveryRequest> => {
  const existingPendingRequest = await RecoveryRequest.findOne({
    userId: payload.userId,
    type: payload.type,
    status: 'pending',
  });

  if (existingPendingRequest) {
    throw new AppError(httpStatus.CONFLICT, 'A pending request already exists.');
  }

  if(payload.type === "venue"){
    const venue = await Venue.findOne({userId: payload.userId})
    if(venue){
      payload.venueId = venue._id as ObjectId;
    }
  }

  const request = await RecoveryRequest.create(payload);
  return request;
};

// Get all account recovery requests (admin)
const getAllAccountRecoveryRequests = async (query: any) => {
// return RecoveryRequest.find({type: "account"}).sort({ createdAt: -1 }).populate('userId');
  const baseQuery = RecoveryRequest.find({ type: 'account' }).populate('userId', 'fullName email gender address createdAt'); // 👈 populate here


  const accountRecoveryRequestsQuery = new QueryBuilder(baseQuery, query)
      .search(['fullName'])
      .filter()
      .sort()
      .paginate()
      .fields();
  
    const result = await accountRecoveryRequestsQuery.modelQuery;
    const meta = await accountRecoveryRequestsQuery.countTotal();
    return { meta, result };
};

// Get all venue recovery requests (admin)
const getAllVenueRecoveryRequests = async (query: any)=> {
  // return RecoveryRequest.find({type: "venue"}).sort({ createdAt: -1 }).populate('venueId');
  
  const venueRecoveryRequestsQuery = new QueryBuilder(RecoveryRequest.find({type: "venue"}), query)
      .search(['fullName'])
      .filter()
      .sort()
      .paginate()
      .fields();
  
    const result = await venueRecoveryRequestsQuery.modelQuery;
    const meta = await venueRecoveryRequestsQuery.countTotal();
    return { meta, result };
};

// Get requests by user
const getUserRecoveryRequests = async (
  userId: string
): Promise<IRecoveryRequest[]> => {
  return RecoveryRequest.find({ userId }).sort({ createdAt: -1 });
};

// Update request status (admin)
const updateRecoveryRequestStatus = async (
  id: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<IRecoveryRequest | null> => {

  const updated = await RecoveryRequest.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  console.log("update recovery data ->>> ", updated)
  if (!updated) {
    throw new AppError(httpStatus.NOT_FOUND, 'Recovery request not found');
  }

  if(updated.type === 'account' && status === 'approved'){
    await User.findByIdAndUpdate(updated.userId, {isBlocked: false, isDeleted: false}, {new: true})
  }
  else if(updated.type === 'venue' && status === 'approved'){
    await Venue.findByIdAndUpdate(updated.venueId, {isBlocked: false, isDeleted: false}, {new: true})
  }

  return updated;
};


export const recoveryRequestService = {
    createRecoveryRequest,
    getAllAccountRecoveryRequests,
    getAllVenueRecoveryRequests,
    getUserRecoveryRequests,
    updateRecoveryRequestStatus
}
