import { sendEmail } from "./mailSender";



interface OtpSendEmailParams {
  sentTo: string;
  subject: string;
  name: string;
  otp: string | number;
  expiredAt: string;
}

const otpSendEmail = async ({
  sentTo,
  subject,
  name,
  otp,
  expiredAt,
}: OtpSendEmailParams): Promise<void> => {
  await sendEmail(
    sentTo,
    subject,
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
       <h1>Hello dear, ${name}</h1>
      <h2 style="color: #4CAF50;">Your One Time OTP</h2>
      <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
        <p style="font-size: 16px;">Your OTP is: <strong>${otp}</strong></p>
        <p style="font-size: 14px; color: #666;">This OTP is valid until: ${expiredAt.toLocaleString()}</p>
      </div>
    </div>`,
  );
};

const otpSendEmailForgetPassword = async ({
  sentTo,
  subject,
  name,
  otp,
  expiredAt,
}: OtpSendEmailParams): Promise<void> => {
  await sendEmail(
    sentTo,
    subject,
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 30px; border-radius: 8px; line-height: 1.6; color: #333;">
      <h2 style="color: #075B5D; text-align: center;">Your "This is Mauritius" OTP Code to Reset Your Password</h2>
      
      <p>Warm Greetings ${name},</p>
      
      <p>You’ve requested to reset your password on the <strong>"This Is Mauritius"</strong> app.</p>
      
      <div style="background-color: #e0f2f1; padding: 20px; border-left: 6px solid #075B5D; border-radius: 5px; text-align: center; margin: 20px 0;">
        <p style="font-size: 18px; margin: 0;">Here is your One-Time Password (OTP):</p>
        <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #075B5D;">${otp}</p>
      </div>
      
      <p>For your security, this code is valid for the next 10 minutes and can only be used once. If you did not request a password reset, please ignore this email or contact our support team immediately.</p>
      
      <p>Thank you for being part of the This Is Mauritius community.</p>
      
      <p>We’re here to keep your experience safe, simple, and inspiring.</p>
      
      <p>Warm regards,<br/><strong>This is Mauritius Team</strong></p>
    </div>`
  );
};

interface SubscriptionRequestEmailParams {
  sentTo: string;
  subject: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userAddress: string;
  subscriptionName: string;
}

// Assuming you already have a `sendEmail` utility function.
const mailSendToAdminOnSubscriptionRequest = async ({
  sentTo,
  subject,
  userName,
  userEmail,
  userPhone,
  userAddress,
  subscriptionName,
}: SubscriptionRequestEmailParams): Promise<void> => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2E86C1;">Manual Subscription Request</h2>
      <p>A user has requested to subscribe manually. Below are the submitted details:</p>
      
      <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; border: 1px solid #ccc;">
        <p><strong>Full Name:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Phone:</strong> ${userPhone}</p>
        <p><strong>Address:</strong> ${userAddress}</p>
        <p><strong>Requested Subscription:</strong> ${subscriptionName}</p>
      </div>

      <p style="margin-top: 20px;">Please review this request and contact the user to complete the subscription process manually.</p>
      
      <p style="margin-top: 10px;">Best regards,<br/>Your System</p>
    </div>
  `;

  await sendEmail(sentTo, subject, htmlContent);
};


export { otpSendEmail, otpSendEmailForgetPassword, mailSendToAdminOnSubscriptionRequest };
