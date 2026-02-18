const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transporter = nodemailer.createTransport({
  host: config.email.smtp.host,
  port: config.email.smtp.port,
  secure: false,
  auth: {
    user: config.email.smtp.auth.user,
    pass: config.email.smtp.auth.pass,
  },
});

transporter
  .verify()
  .then(() => logger.info('Connected to email server'))
  .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));

const sendOTPEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: config.email.from,
    to: config.email.to || toEmail,
    subject: 'OTP Verification',
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
      <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <h2 style="margin-top: 0; color: #2c3e50;">OTP Verification</h2>
        
        <p style="font-size: 15px; color: #555;">
          Hello,
        </p>

        <p style="font-size: 15px; color: #555;">
          Please use the following One-Time Password (OTP) to continue:
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <span style="
            display: inline-block;
            font-size: 28px;
            letter-spacing: 6px;
            font-weight: bold;
            color: #2c3e50;
            background: #f1f3f5;
            padding: 12px 20px;
            border-radius: 6px;
          ">
            ${otp}
          </span>
        </div>

        <p style="font-size: 14px; color: #555;">
          ⏳ This OTP is valid for <strong>5 minutes</strong>.
        </p>

        <p style="font-size: 13px; color: #888; margin-top: 20px;">
          If you did not request this OTP, please ignore this email. 
          Do not share this code with anyone for security reasons.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />

        <p style="font-size: 12px; color: #aaa; text-align: center;">
          © ${new Date().getFullYear()} Your App Name. All rights reserved.
        </p>

      </div>
    </div>`,
  });
};

module.exports = { sendOTPEmail };
