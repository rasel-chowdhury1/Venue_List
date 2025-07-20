import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { otpServices } from './otp.service';

const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers?.token as string;

  console.log({ token });

  await otpServices.resendOtpEmail({ token });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP Resent successfully',
    data: {},
  });
});

export const otpControllers = {
  resendOtp,
};
