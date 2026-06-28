const admin = require("../config/firebase.admin");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const emailVerificationTemplate = require("../templates/emailVerification");

// In a real application, you would interact with a database for OTP storage
const otpStore = {}; // { email: { otpHash, expiresAt, purpose } }

const verifyFirebaseIdToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return { phone_number: decodedToken.phone_number, uid: decodedToken.uid };
  } catch (error) {
    throw new Error("Firebase ID token verification failed: " + error.message);
  }
};

const normalizeIndianPhone = (rawPhone) => {
  if (rawPhone.startsWith("+91")) {
    return rawPhone.substring(3); // Strips '+91'
  }
  return rawPhone; // Assumes it's already a 10-digit number or handles other formats
};

const sendEmailOtp = async (email, purpose) => {
  // Configure Nodemailer with Gmail SMTP
  // In a real app, use environment variables for sensitive info
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
    },
  });

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  otpStore[email] = { otpHash, expiresAt, purpose };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Freiwilliger OTP for ${purpose}`,
    html: emailVerificationTemplate(otp),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error("Failed to send OTP email.");
  }
};

const verifyEmailOtp = async (email, otp, purpose) => {
  const storedOtp = otpStore[email];

  if (!storedOtp) {
    throw new Error("OTP not found or expired.");
  }

  if (storedOtp.purpose !== purpose) {
    throw new Error("OTP purpose mismatch.");
  }

  if (Date.now() > storedOtp.expiresAt) {
    delete otpStore[email]; // Clean up expired OTP
    throw new Error("OTP expired.");
  }

  const isValid = await bcrypt.compare(otp, storedOtp.otpHash);

  if (isValid) {
    delete otpStore[email]; // OTP successfully used
    return true;
  } else {
    throw new Error("Invalid OTP.");
  }
};

module.exports = {
  verifyFirebaseIdToken,
  normalizeIndianPhone,
  sendEmailOtp,
  verifyEmailOtp,
};
