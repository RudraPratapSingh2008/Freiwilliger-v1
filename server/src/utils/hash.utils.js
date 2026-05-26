const bcrypt = require('bcryptjs');

const hashOtp = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

const verifyOtp = async (otp, hash) => {
  return bcrypt.compare(otp, hash);
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = { hashOtp, verifyOtp, hashPassword, verifyPassword };
