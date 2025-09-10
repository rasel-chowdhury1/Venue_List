import moment from 'moment';
import config from '../../config';
import { generateOtp } from '../../utils/otpGenerator';

const generateOptAndExpireTime = (expireTime?: number) => {
  const otp = generateOtp();

  const otpExpiryTime = expireTime || parseInt(config.otp_expire_time as string) || 2;

  const expiredAt = moment().add(otpExpiryTime, 'minute').toISOString();

  return {
    otp,
    expiredAt,
  };
};

export { generateOptAndExpireTime };
