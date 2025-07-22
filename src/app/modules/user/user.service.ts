/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import config from '../../config';
import { getAdminId } from '../../DB/adminStore';
import AppError from '../../error/AppError';
import { otpSendEmail } from '../../utils/emailNotifiacation';
import { createToken, verifyToken } from '../../utils/tokenManage';
import Notification from '../notifications/notifications.model';
import { TPurposeType } from '../otp/otp.interface';
import { otpServices } from '../otp/otp.service';
import { generateOptAndExpireTime } from '../otp/otp.utils';
import { IProfile } from '../profile/profile.interface';
import Profile from '../profile/profile.model';
import Venue from '../venue/venue.model';
import { DeleteAccountPayload, TUser, TUserCreate } from './user.interface';
import { User } from './user.models';
import { sendEmail } from '../../utils/mailSender';
import { contactUsEmailTemplate } from './user.utils';

export type IFilter = {
  searchTerm?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export interface OTPVerifyAndCreateUserProps {
  otp: string;
  token: string;
}

const createUserToken = async (payload: TUserCreate) => {
  const { role, email, fullName, password } = payload;

  // user exist check
  const userExist = await userService.getUserByEmail(email);

  if (userExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exist!!');
  }

  const { isExist, isExpireOtp } = await otpServices.checkOtpByEmail(email);

  const { otp, expiredAt } = generateOptAndExpireTime();

  let otpPurpose: TPurposeType = 'email-verification';

  if (isExist && !isExpireOtp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'otp-exist. Check your email.');
  } else if (isExist && isExpireOtp) {
    const otpUpdateData = {
      otp,
      expiredAt,
    };

    await otpServices.updateOtpByEmail(email, otpUpdateData);
  } else if (!isExist) {
    await otpServices.createOtp({
      name: 'Customer',
      sentTo: email,
      receiverType: 'email',
      purpose: otpPurpose,
      otp,
      expiredAt,
    });
  }

  const otpBody: Partial<TUserCreate> = {
    email,
    fullName,
    password,
    role,
  };

  // send email
  // console.log('before otp send email');
  process.nextTick(async () => {
    await otpSendEmail({
      sentTo: email,
      subject: 'Your one time otp for email  verification',
      name: 'Customer',
      otp,
      expiredAt: expiredAt,
    });
  });
  // console.log('after otp send email');

  // crete token
  const createUserToken = createToken({
    payload: otpBody,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.otp_token_expire_time as string | number,
  });

  return createUserToken;
};

const otpVerifyAndCreateUser = async ({
  otp,
  token,
}: OTPVerifyAndCreateUserProps) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }

  const decodeData = verifyToken({
    token,
    access_secret: config.jwt_access_secret as string,
  });

  if (!decodeData) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorised');
  }

  const { password, email, role } = decodeData;

  const isOtpMatch = await otpServices.otpMatch(email, otp);

  if (!isOtpMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match');
  }

  process.nextTick(async () => {
    await otpServices.updateOtpByEmail(email, {
      status: 'verified',
    });
  });

  const isExist = await User.isUserExist(email as string);

  if (isExist) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'User already exists with this email',
    );
  }

  const userData = {
    password,
    email,
    role,
    termsAndConditions: true,
  };

  const user = await User.create(userData);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed');
  }

  // Create user profile
  const profileData: IProfile = {
    user: user._id as any,
  };

  const profile = await Profile.create(profileData);
  if (!profile) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Profile creation failed');
  }

  const jwtPayload: {
    userId: string;
    role: string;
    email: string;
  } = {
    email: user.email,
    userId: user?._id?.toString() as string,
    role: user?.role,
  };

  const accessToken = createToken({
    payload: jwtPayload,
    access_secret: config.jwt_access_secret as string,
    expity_time: '5m',
  });

  return accessToken;
};

const completedUser = async (id: string, payload: Partial<TUser>) => {
  const {
    role,
    email,
    isBlocked,
    isDeleted,
    password,
    about,
    city,
    postalAddress,
    ...rest
  } = payload;

  const user = await User.findByIdAndUpdate(id, rest, { new: true });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User completing failed');
  }

  // If any optional fields (about, phone, city, postalAddress) exist, update the Profile asynchronously
  if (about || city || postalAddress) {
    // Don't wait for the profile update, run it in the background
    Profile.findOneAndUpdate(
      { user: id },
      { about, city, postalAddress },
      { new: true },
    )
      .then((profile) => {
        console.log('Profile updated:', profile);
      })
      .catch((err) => {
        console.error('Error updating profile:', err);
      });
  }

  const newNotification = new Notification({
    userId: user?._id, // Ensure that userId is of type mongoose.Types.ObjectId
    receiverId: getAdminId(), // Ensure that receiverId is of type mongoose.Types.ObjectId
    message: 'New user added in your app',
    type: 'added', // Use the provided type (default to "FollowRequest")
    isRead: false, // Set to false since the notification is unread initially
    timestamp: new Date(), // Timestamp of when the notification is created
  });

  // No need to wait for the notification to be saved, run it asynchronously
  newNotification.save().catch((err) => {
    console.error('Error saving notification:', err);
  });

  return user;
};

const updateUser = async (id: string, payload: Partial<TUser>) => {
  const { role, email, isBlocked, isDeleted, password,about, phone, city,postalAddress, postalCode, ...rest } = payload;
  console.log({phone})
  const user = await User.findByIdAndUpdate(id, rest, { new: true });


  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User updating failed');
  }

    // Build profile update object only with defined fields
  const profileUpdates: any = {};
  if (about !== undefined) profileUpdates.about = about;
  if (phone !== undefined) profileUpdates.phone = phone;
  if (city !== undefined) profileUpdates.city = city;
  if (postalAddress !== undefined) profileUpdates.postalAddress = postalAddress;
  if (postalCode !== undefined) profileUpdates.postalCode = postalCode;

  // Update profile if there is something to update
  if (Object.keys(profileUpdates).length > 0) {
    console.log({id})
    const result = await Profile.findOneAndUpdate({ user: id }, profileUpdates, { new: true });
    console.log({result})
  }

  return user;
};

// ------------ rest ------------
const getAllUserQuery = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const userQuery = new QueryBuilder(User.find({ _id: { $ne: userId } }), query)
    .search(['fullName'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();
  return { meta, result };
};

const getUsersWithoutCreatedVenue = async (query: Record<string, unknown>) => {
  const users = await User.find({
    venueCreated: 'none',
    role: 'user',
    isDeleted: false,
    isBlocked: false,
  });
  return users || [];
};

const getSpecificVenueCreatedStatus = async(userId: string) => {
  const user = await User.findById(userId);
  return {
    venueCreated: user?.venueCreated,
    venueCreatedAdmin: user?.venueCreatedAdmin
  };
};

const getAllUserCount = async () => {
  const allUserCount = await User.countDocuments();
  return allUserCount;
};

const getUsersOverview = async (userId: string, year: any) => {
  try {
    
    // Fetch total user count
    const totalUsers = await User.countDocuments();

    // Fetch user growth over time for the specified year (monthly count with month name)
    const userOverview = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          }, // Filter by year
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' }, // Group by month of the 'createdAt' date
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
          monthName: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 1] }, then: 'January' },
                { case: { $eq: ['$_id', 2] }, then: 'February' },
                { case: { $eq: ['$_id', 3] }, then: 'March' },
                { case: { $eq: ['$_id', 4] }, then: 'April' },
                { case: { $eq: ['$_id', 5] }, then: 'May' },
                { case: { $eq: ['$_id', 6] }, then: 'June' },
                { case: { $eq: ['$_id', 7] }, then: 'July' },
                { case: { $eq: ['$_id', 8] }, then: 'August' },
                { case: { $eq: ['$_id', 9] }, then: 'September' },
                { case: { $eq: ['$_id', 10] }, then: 'October' },
                { case: { $eq: ['$_id', 11] }, then: 'November' },
                { case: { $eq: ['$_id', 12] }, then: 'December' },
              ],
              default: 'Unknown', // Default value in case month is not valid
            },
          },
        },
      },
      { $sort: { _id: 1 } }, // Sort by month (ascending)
    ]);

    // Fetch recent users
    const recentUsers = await User.find({ _id: { $ne: userId } })
      .sort({ createdAt: -1 })
      .limit(6);

    return {
      totalUsers,
      userOverview, // Includes month names with user counts
      recentUsers,
    };
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    throw new Error('Error fetching dashboard data.');
  }
};

// const getUsersAndVenuesOverview = async (userId: string, year: any) => {
//   try {
//     // Fetch total user count
//     const totalUsers = await User.countDocuments();
//     const totalVenues = await Venue.countDocuments();

//     // Fetch user growth over time for the specified year (monthly count with month name)
//     const userOverview = await User.aggregate([
//       {
//         $match: {
//           createdAt: {
//             $gte: new Date(`${year}-01-01`),
//             $lt: new Date(`${year + 1}-01-01`),
//           }, // Filter by year
//         },
//       },
//       {
//         $group: {
//           _id: { $month: '$createdAt' }, // Group by month of the 'createdAt' date
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           count: 1,
//           monthName: {
//             $switch: {
//               branches: [
//                 { case: { $eq: ['$_id', 1] }, then: 'January' },
//                 { case: { $eq: ['$_id', 2] }, then: 'February' },
//                 { case: { $eq: ['$_id', 3] }, then: 'March' },
//                 { case: { $eq: ['$_id', 4] }, then: 'April' },
//                 { case: { $eq: ['$_id', 5] }, then: 'May' },
//                 { case: { $eq: ['$_id', 6] }, then: 'June' },
//                 { case: { $eq: ['$_id', 7] }, then: 'July' },
//                 { case: { $eq: ['$_id', 8] }, then: 'August' },
//                 { case: { $eq: ['$_id', 9] }, then: 'September' },
//                 { case: { $eq: ['$_id', 10] }, then: 'October' },
//                 { case: { $eq: ['$_id', 11] }, then: 'November' },
//                 { case: { $eq: ['$_id', 12] }, then: 'December' },
//               ],
//               default: 'Unknown', // Default value in case month is not valid
//             },
//           },
//         },
//       },
//       { $sort: { _id: 1 } }, // Sort by month (ascending)
//     ]);

//     const venueOverview = await Venue.aggregate([
//       {
//         $match: {
//           createdAt: {
//             $gte: new Date(`${year}-01-01`),
//             $lt: new Date(`${year + 1}-01-01`),
//           }, // Filter by year
//         },
//       },
//       {
//         $group: {
//           _id: { $month: '$createdAt' }, // Group by month of the 'createdAt' date
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           count: 1,
//           monthName: {
//             $switch: {
//               branches: [
//                 { case: { $eq: ['$_id', 1] }, then: 'January' },
//                 { case: { $eq: ['$_id', 2] }, then: 'February' },
//                 { case: { $eq: ['$_id', 3] }, then: 'March' },
//                 { case: { $eq: ['$_id', 4] }, then: 'April' },
//                 { case: { $eq: ['$_id', 5] }, then: 'May' },
//                 { case: { $eq: ['$_id', 6] }, then: 'June' },
//                 { case: { $eq: ['$_id', 7] }, then: 'July' },
//                 { case: { $eq: ['$_id', 8] }, then: 'August' },
//                 { case: { $eq: ['$_id', 9] }, then: 'September' },
//                 { case: { $eq: ['$_id', 10] }, then: 'October' },
//                 { case: { $eq: ['$_id', 11] }, then: 'November' },
//                 { case: { $eq: ['$_id', 12] }, then: 'December' },
//               ],
//               default: 'Unknown', // Default value in case month is not valid
//             },
//           },
//         },
//       },
//       { $sort: { _id: 1 } }, // Sort by month (ascending)
//     ]);

//     // Fetch recent users
//     const recentUsers = await User.find({ _id: { $ne: userId } })
//       .sort({ createdAt: -1 })
//       .limit(6);

//     return {
//       totalUsers,
//       totalVenues,
//       userOverview, // Includes month names with user counts
//       venueOverview,
//       recentUsers,
//     };
//   } catch (error) {
//     console.error('Error fetching dashboard overview:', error);
//     throw new Error('Error fetching dashboard data.');
//   }
// };

const getUsersAndVenuesOverview = async (userId: string, year: number) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVenues = await Venue.countDocuments();

    const userOverview = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          userCount: { $sum: 1 },
        },
      },
    ]);

    const venueOverview = await Venue.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          venueCount: { $sum: 1 },
        },
      },
    ]);

    const monthNames = [
      '', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Initialize all 12 months with zeroes
    const monthlyOverview: any[] = Array.from({ length: 12 }, (_, i) => ({
      _id: i + 1,
      userCount: 0,
      venueCount: 0,
      monthName: monthNames[i + 1],
    }));

    // Merge user data
    userOverview.forEach(({ _id, userCount }) => {
      const index = _id - 1;
      monthlyOverview[index].userCount = userCount;
    });

    // Merge venue data
    venueOverview.forEach(({ _id, venueCount }) => {
      const index = _id - 1;
      monthlyOverview[index].venueCount = venueCount;
    });

    // Recent users
    const recentUsers = await User.find({ _id: { $ne: userId } })
      .sort({ createdAt: -1 })
      .limit(6);

    return {
      totalUsers,
      totalVenues,
      monthlyOverview,
      recentUsers,
    };
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    throw new Error('Error fetching dashboard data.');
  }
};


const getUserById = async (id: string) => {
  const result = await User.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

// Optimized the function to improve performance, reducing the processing time to 235 milliseconds.
const getMyProfile = async (id: string) => {
  const [userData, profileData] = await Promise.all([
    User.findById(id).lean(),
    Profile.findOne({ user: id }).lean(),
  ]);

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  console.log("profile data ->>> ",{profileData})

  const profileInformation = {
    ...userData,
    ...profileData,
  };

  return profileInformation;
};

const getAdminProfile = async (id: string) => {
  const result = await User.findById(id).lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return result;
};

const getUserByEmail = async (email: string) => {
  const result = await User.findOne({ email });

  return result;
};

const deleteMyAccount = async (id: string, payload: DeleteAccountPayload) => {
  const user: TUser | null = await User.IsUserExistById(id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted');
  }

  if (!(await User.isPasswordMatched(payload.password, user.password))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
  }

  const userDeleted = await User.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!userDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user deleting failed');
  }

  return userDeleted;
};

const blockedUser = async (id: string) => {
  const singleUser = await User.IsUserExistById(id);

  if (!singleUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (singleUser.isBlocked) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already blocked');
  }

  let status = true;
  const user = await User.findByIdAndUpdate(
    id,
    { isBlocked: status },
    { new: true },
  );

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user deleting failed');
  }

  return { status, user };
};

const unBlockedUser = async (id: string) => {
  const singleUser = await User.IsUserExistById(id);

  if (!singleUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!singleUser.isBlocked) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already unblocked');
  }

  let status = false;
  const user = await User.findByIdAndUpdate(
    id,
    { isBlocked: status },
    { new: true },
  );

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user unblock failed');
  }

  return { status, user };
};

const sentContactMesssageToAdminSupport = async(payload: {fullName: string, email: string, subject: string, message: string}) => {
  const template = contactUsEmailTemplate({
        name: `${payload.fullName}`,
        email: `${payload.email}`,
        subject: `${payload.subject}`,
        message: `${payload.message}`,
      })

  console.log({template})
  const result = await sendEmail(
      "raseldev847@gmail.com",
      `Contact Us: ${payload.subject}`,
      template
    );
  console.log("contact us result =>> ", result)
    return
}

export const userService = {
  createUserToken,
  otpVerifyAndCreateUser,
  completedUser,
  getMyProfile,
  getUsersWithoutCreatedVenue,
  getAdminProfile,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteMyAccount,
  blockedUser,
  unBlockedUser,
  getAllUserQuery,
  getAllUserCount,
  getUsersOverview,
  getUsersAndVenuesOverview,
  sentContactMesssageToAdminSupport,
  getSpecificVenueCreatedStatus
};
