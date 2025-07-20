import { Request,Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { mySubscriptionService } from "./mySubscription.service";
import catchAsync from "../../utils/catchAsync";
import httpStatus from 'http-status';


const getMySubscriptionDetails = catchAsync(async (req: Request, res: Response) => {
  const subsList = await mySubscriptionService.getMySubscriptions(req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My subscription fetched successfully!",
    data: subsList,
  })
});

const purchasedSubscription = catchAsync(async (req: Request, res: Response) => {
      
      const {userId} = req.user
      const {subscriptId, paymentDetails} = req.body;
  
    console.log(req.body)
    const newTicket = await mySubscriptionService.purchaseSubscription(userId, subscriptId, paymentDetails);
  
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Subscription buy successfully',
      data: newTicket,
    });
  });

// const deductSubscriptionBalance = async (user, deductionAmount) => {
//   if (!user) {
//     throw new Error("User not found");
//   }
//   if (user.remainingDispatch < deductionAmount) {
//     throw new Error("Insufficient subscription balance");
//   }
//   user.remainingDispatch -= deductionAmount;
//   await user.save();

//   return user.remainingDispatch;
// };

// // have to solve issue
// const myPackages = catchAsync(async (req, res) => {
//   const subsList = await MySubscription.find({
//     user: req.User._id,
//   }).populate("subscription");
//   return res
//     .status(httpStatus.OK)
//     .json(
//       response({
//         statusCode: httpStatus.OK,
//         message: "subscription-fetched",
//         data: subsList,
//         status: "OK",
//       })
//     );
// });

export const mySubscriptionController = {
  getMySubscriptionDetails,
  purchasedSubscription,
//   deductSubscriptionBalance,
//   myPackages
}
