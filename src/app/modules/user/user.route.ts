import { Router } from 'express';
import auth from '../../middleware/auth';
import fileUpload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import validateRequest from '../../middleware/validateRequest';
import { resentOtpValidations } from '../otp/otp.validation';
import { userController } from './user.controller';
import { userValidation } from './user.validation';
const upload = fileUpload('./public/uploads/profile');

export const userRoutes = Router();

userRoutes
  .post(
    '/create',
    validateRequest(userValidation?.userValidationSchema),
    userController.createUser,
  )

  .post(
    '/create-user-verify-otp',
    validateRequest(resentOtpValidations.verifyOtpZodSchema),
    userController.userCreateVarification,
  )

  .post(
    '/complete',
    auth('user', "admin"),
    upload.single('image'),
    parseData(),
    validateRequest(userValidation?.completeUserValidationSchema),
    userController.completedProfile,
  )

  .post(
    "/contactUs",
    auth("user"),
    userController.sentContactMesssageToAdminSupport
  )

  .get(
    '/my-profile',
    auth(
      'user', 'admin',
    ),
    userController.getMyProfile,
  )

  .get(
    "/unCreatedVenueUser",
    auth("admin"),
    userController.getUsersWithoutCreatedVenue
  )

  .get(
    '/admin-profile',
    auth(
      'admin'
    ),
    userController.getAdminProfile,
  )
  .get('/all', auth("admin"), userController.getAllUsers)
  
  .get("/all-overview", auth("admin"), userController.getAllUsersAndVenuesOverview)



  
  .get(
    '/:id',
    auth("user", "admin"),
    userController.getUserById
  )

 

  .patch(
    '/update-my-profile',
    auth('user', "admin"),
    upload.single('image'),
    parseData(),
    userController.updateMyProfile,
  )

  .patch(
    '/block/:id',
    auth('admin'),
    userController.blockedUser,
  )

  .patch(
    '/unblock/:id',
    auth('admin'),
    userController.unBlockedUser,
  )
  
  .delete(
    '/delete-my-account',
    auth('user'
    ),
    userController.deleteMyAccount,
  );

// export default userRoutes;
