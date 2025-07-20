import AppError from '../../error/AppError';
import Payment from '../payment/payment.model';
import Subcription from '../subscription/subcription.model';
import { User } from '../user/user.models';
import MySubscription from './mySubscription.model';

const purchaseSubscription = async (
  userId: string,
  subsId: string,
  paymentDetails: {paymentId: string, paymentMethod: string},
) => {
  const session = await Subcription.startSession();
  session.startTransaction();

  try {
    const subscription = await Subcription.findById(subsId).session(session);

    if (!subscription) {
      throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found');
    }

    // Record payment
    const payment = new Payment({
      userId,
      amount: subscription.price,
      paymentStatus: "paid",
      transactionId: paymentDetails.paymentId,
      subscription: subsId,
      paymentMethod: paymentDetails.paymentMethod,
    });

    await payment.save({ session });

    const today = new Date();
    let expiryDate;
    let durationType= subscription.durationType;
    let duration;
    if(durationType === "Month"){
      duration = subscription.duration * 30;
    }
    else if(durationType === "Video"){

    
    expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + 1);
    }
    let userSubscription = new MySubscription({
      user: userId,
      subscription: subsId,
      expiryDate: expiryDate,
      type: subscription.type
    });

    await userSubscription.save({ session });

  await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          subscriptionHistory: {
            type: subscription.type,
            purchaseDate: today,
            expiryDate: expiryDate,
          },
        },
        isSubcription: 'active',
      },
      { new: true, runValidators: true, session } // runValidators ensures enum values like 'active' are checked
    );

    // await User.findByIdAndUpdate(
    //   userId,
    //   { isSubcription: "active" },
    //   { new: true, session }
    // );

    await session.commitTransaction();
    session.endSession();

    return { payment, subscription: userSubscription };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;  // rethrow so caller knows
  }
};



const getMySubscriptions = async (userId: string) => {
  return await MySubscription.find({
    user: userId,
    expiryDate: { $gte: new Date() },
  }).populate("subscription") || [];
};

export const mySubscriptionService = {
  purchaseSubscription,
  getMySubscriptions,
};
