import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import Subcription from '../subscription/subcription.model';
import { SubcriptionPaymentService } from './subscriptionPayment.service';


const confirmPaymentSubcription = catchAsync(async (req: Request, res: Response) => {
  console.log('====== before confirm payment ====>>> ', req.body);

  const {userId} = req.user;
  const { paymentId,subcriptionId, paymentType } = req.body;

  const isSubcription = await Subcription.findById(subcriptionId) as any;

  console.log({isSubcription})
  
  if(!isSubcription){
    sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'Subcription is not found',
      data: "",
    });
  }

  const data = {
    paymentIntentId: paymentId,
    userId,
    subcriptionId,
    amount: isSubcription.price,
    duration: isSubcription.duration,
    paymentMethod: paymentType,
    subscriptionType: isSubcription.type
  };

  const paymentResult = await SubcriptionPaymentService.confirmPaymentSubcription(data) || "";

  console.log({paymentResult})

  if (paymentResult) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'thank you for subcrption',
      data: paymentResult,
    });
  }
});


const sentNotificationToAdminEmail = catchAsync(async (req: Request, res: Response) => {
  console.log('====== before confirm payment ====>>> ', req.body);

  const {userId} = req.user;
  const { subcriptionId} = req.body;
  

  const result = await SubcriptionPaymentService.sentNotificationToAdminEmail({userId: userId,subscriptionId: subcriptionId});


    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Successfully mail sented to admin',
      data: result,
    });

});





export const SubcriptionPaymentController = {
  confirmPaymentSubcription,
  sentNotificationToAdminEmail
};
