import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import MySubscription from '../mySubscription/mySubscription.model';
import { User } from '../user/user.models';
import Payment from '../payment/payment.model';
import Subcription from '../subscription/subcription.model';
import { mailSendToAdminOnSubscriptionRequest } from '../../utils/emailNotifiacation';


// ======= confirm payment start =====
const confirmPaymentSubcription = async(data: any) => {
  console.log('==== confirm payment data ===>>>>>n ', data);
  const { userId, subcriptionId, amount, duration, paymentIntentId, paymentMethod, subscriptionType} = data;

  if (!paymentIntentId ) {
    // return res.status(400).json({ success: false, message: "Missing sessionId" });
    throw new AppError(httpStatus.BAD_REQUEST, 'Missing paymentId ');
  }

  let paymentData;
  try {

    const paymentDataBody = {
      user_id: userId,
      amount: Number(amount),
      paymentStatus: "paid",
      transactionId: paymentIntentId,
      paymentMethod,
      subscription: subcriptionId,
    };
  
    const isExistPaymentId = await Payment.findOne({
      transactionId: paymentIntentId,
    });
  
    if (isExistPaymentId) {
      // return res.status(400).json({ success: false, message: "Payment Intent not found" });
      throw new AppError(httpStatus.BAD_REQUEST, 'Payment id already use');
    }
  
    console.log('==== payment data body ===>>>> ', paymentDataBody);

    paymentData = new Payment(paymentDataBody);
    await paymentData.save();

    const today = new Date();

    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + Number(duration));

    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          subscriptionHistory: {
            type: subscriptionType,
            purchaseDate: today,
            expiryDate: expiryDate,
          },
        },
        isSubcription: 'active',
      },
      { new: true, runValidators: true } // runValidators ensures enum values like 'active' are checked
    );

    if (!updateUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User not exist');
    }

    const existingSubscription =
      (await MySubscription.findOne({ user: userId, type: subscriptionType })) ?? false;

    if (existingSubscription) {
      existingSubscription.subscription = subcriptionId;
      existingSubscription.expiryDate = expiryDate;

      await existingSubscription.save();
    } else {
      const newSubscription = new MySubscription({
        user: userId,
        subscription: subcriptionId,
        expiryDate
      });

      await newSubscription.save();
    }
  } catch (error: any) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, error.message);
  }

  return paymentData;
}

// ======= confirm payment end =======

// ======= sent notification to Admin Email start =======
const sentNotificationToAdminEmail = async (data: { userId: string; subscriptionId: string }): Promise<void> => {
  const { userId, subscriptionId } = data;

  // Check if userId or subscriptionId is missing
  if (!userId || !subscriptionId) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Missing userId or subscriptionId');
  }

  // Find user
  const isExistUser = await User.findById(userId);
  if (!isExistUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Find subscription
  const isExistSubscription = await Subcription.findById(subscriptionId);
  if (!isExistSubscription) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found');
  }

  // Send email to admin
  await mailSendToAdminOnSubscriptionRequest({
    sentTo: 'raseldev847@gmail.com',
    subject: 'New Manual Subscription Request',
    userName: isExistUser.fullName || 'N/A',
    userEmail: isExistUser.email || 'N/A',
    userPhone: isExistUser.phone || 'N/A',
    userAddress: isExistUser.address || 'N/A',
    subscriptionName: isExistSubscription.name || 'N/A',
  });
};

// ======= sent notification to Admin Email end =======






export const SubcriptionPaymentService = {
  confirmPaymentSubcription,
  sentNotificationToAdminEmail
};
