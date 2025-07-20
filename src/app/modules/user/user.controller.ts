import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { userService } from './user.service';

import httpStatus from 'http-status';
import { storeFile } from '../../utils/fileHelper';
import fs, { access } from 'fs';
import { uploadFileToS3 } from '../../middleware/fileUploadS3';

const createUser = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body);
  const createUserToken = await userService.createUserToken(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Check email for OTP',
    data: createUserToken ,
  });
});

const userCreateVarification = catchAsync(async (req, res) => {
  console.log('..........1..........');
  const token = req.headers?.token as string;
  console.log('token', token);
  const { otp } = req.body;
  console.log('otp', otp);
  const newUser = await userService.otpVerifyAndCreateUser({ otp, token });

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User create successfully',
    data: newUser,
  });
});

const completedProfile = catchAsync(async (req: Request, res: Response) => {
  if (req?.file) {
    // req.body.profileImage = storeFile('profile', req?.file?.filename);

    // upload file in bucket function is done
    try {
      const data = await uploadFileToS3(req.file)


      console.log("data----->>>> ",data)
      // deleting file after upload
      fs.unlinkSync(req.file.path)
  
      req.body.profileImage = data.Location;
    } catch (error) {
      console.log("====erro9r --->>> ", error)
      if(fs.existsSync(req.file.path)){
        fs.unlinkSync(req.file.path)
      }
    }

  }

  const result = await userService.completedUser(req?.user?.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'profile completed successfully',
    data: result,
  });
});

// rest >...............


const getAllUsers = catchAsync(async (req, res) => {
  const {userId} = req.user;
  const result = await userService.getAllUserQuery(userId, req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'Users All are requered successful!!',
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getUserById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User fetched successfully',
    data: result,
  });
});

const getUsersWithoutCreatedVenue = catchAsync(async (req, res) => {
  const result = await userService.getUsersWithoutCreatedVenue(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Uncreated users are fetched successful!!',
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {

  console.log("get my profile ->>> ",req?.user?.userId)
  const result = await userService.getMyProfile(req?.user?.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'profile fetched successfully',
    data: result,
  });
});

const getAdminProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getAdminProfile(req?.user?.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'profile fetched successfully',
    data: result,
  });
});


const getAllUsersOverview = catchAsync(async (req, res) => {
  console.log("get all user overviewo _>>>> ");
  const {userId} = req.user;
  // Default to the current year if the 'year' query parameter is not provided
  const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
  
  // Ensure the year is valid
  if (isNaN(year)) {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Invalid year parameter.',
      data: null,
    });
  }

  const result = await userService.getUsersOverview(userId, year)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get all User overview fetched successfully',
    data: result,
  });
});

const getAllUsersAndVenuesOverview = catchAsync(async (req, res) => {
  console.log("get all user overviewo _>>>> ");
  const {userId} = req.user;
  // Default to the current year if the 'year' query parameter is not provided
  const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
  
  // Ensure the year is valid
  if (isNaN(year)) {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Invalid year parameter.',
      data: null,
    });
  }

  const result = await userService.getUsersAndVenuesOverview(userId, year)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get all Users ans Venues overview fetched successfully',
    data: result,
  });
});



const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  if (req?.file) {
    // req.body.profileImage = storeFile('profile', req?.file?.filename);

    // upload file in bucket function is done
    try {
      const data = await uploadFileToS3(req.file)


      console.log("data----->>>> ",data)
      // deleting file after upload
      fs.unlinkSync(req.file.path)
  
      req.body.profileImage = data.Location;
    } catch (error) {
      console.log("====erro9r --->>> ", error)
      if(fs.existsSync(req.file.path)){
        fs.unlinkSync(req.file.path)
      }
    }
  }
  // console.log('file', req?.file);
  // console.log('body data', req.body);
  
  console.log(req.headers.authorization)

  const result = await userService.updateUser(req?.user?.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'profile updated successfully',
    data: result,
  });
});

const blockedUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.blockedUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User blocked successfully`,
    data: result.user,
  });
});

const unBlockedUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.unBlockedUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User unblocked successfully`,
    data: result.user,
  });
});

const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.deleteMyAccount(req.user?.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

const sentContactMesssageToAdminSupport = catchAsync(async (req: Request, res: Response) => {

  const {fullName, email} = req.user;
  const {subject, message} = req.body;
  const result = await userService.sentContactMesssageToAdminSupport({fullName, email, subject, message});
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Message sent successfully.',
    data: result,
  });
});

export const userController = {
  createUser,
  userCreateVarification,
  completedProfile,
  getUsersWithoutCreatedVenue,
  getUserById,
  getMyProfile,
  getAdminProfile,
  updateMyProfile,
  blockedUser,
  unBlockedUser,
  deleteMyAccount,
  getAllUsers,
  getAllUsersOverview,
  getAllUsersAndVenuesOverview,
  sentContactMesssageToAdminSupport
};
