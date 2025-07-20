import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, subject: string, html: string) => {
 
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    secure: config.NODE_ENV === 'production' ? true:false,   
    port: config.NODE_ENV === 'production' ? 465:587,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      // user: config.nodemailer_host_email,
      // pass: config.nodemailer_host_pass,
      user: config.nodemailer.auth_user as string,
      pass: config.nodemailer.auth_pass as string
    },

  });


  

  try {
     console.log('mail send started');
    await transporter.sendMail({
      from: 'team.robust.dev@gmail.com', // sender address
      to, // list of receivers
      subject,
      text: '', // plain text body
      html, // html body
    });
    
  } catch (error) {
    console.log('send mail error:', error);
    
  }
  console.log('mail sucessfully sented');
  return
};



















