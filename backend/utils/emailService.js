const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SERVER,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

const sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"SEMIS - NexCore Technologies" <${process.env.MAIL_USERNAME}>`,
    to: toEmail,
    subject: 'Your SEMIS Login OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto;">
        <h2 style="color: #6366f1;">SEMIS Security Code</h2>
        <p>Your one-time password is:</p>
        <h1 style="letter-spacing: 8px; color: #0a0a0a;">${otp}</h1>
        <p>This code expires in <strong>5 minutes</strong>.</p>
        <p>If you did not request this, please contact your administrator immediately.</p>
        <hr/>
        <small style="color: #999;">NexCore Technologies — SEMIS Internal Platform</small>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };