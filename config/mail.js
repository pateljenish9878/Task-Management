const nodemailer = require('nodemailer');

let transporter;

const createTransporter = async () => {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: '6846jenishpatel@gmail.com',
      pass: 'mwziowzwevvxremi'    
    }
  });
  
  return transporter;
};

const sendOTPEmail = async (email, otp) => {
  try {
    if (!transporter) {
      transporter = await createTransporter();
    }
    
    const mailOptions = {
      from: '"Task Manager" 6846jenishpatel@gmail.com',
      to: email,
      subject: 'Password Reset OTP - Task Management App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #3949ab;">Task Management App</h2>
          <p>Hello,</p>
          <p>You have requested to reset your password. Please use the following OTP to complete the process:</p>
          <h3 style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px;">${otp}</h3>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <p>Thank you,<br>Task Management App Team</p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    
    return true;
  } catch (error) {
    console.error('Error sending email: ', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail
}; 