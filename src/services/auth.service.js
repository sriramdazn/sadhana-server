const httpStatus = require('http-status');
const { v6: uuid6 } = require('uuid');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { Otp } = require('../models');

/**
 * Login with username
 * @param {string} email
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email');
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

// Save OTP
const saveOtp = async (email, otp) => {
  const otpId = uuid6();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
  const otpRecord = await Otp.create({ email, otp, otpId, expiresAt });
  return otpRecord;
};

/**
 * Verify otpId
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
// const verifyEmailOtp = async (otpId, otp) => {
//   const record = await Otp.findOne({ otpId, otp });
//   if (!record) return false;
//   if (record.expiresAt < Date.now()) return false;
//   return { email: record.email, verified: true };
// };

const verifyOtp = async (otpId, otp) => {
  const validateUser = await Otp.findOne(otpId, otp);
  if (!validateUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP');
  }
  return validateUser;
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  saveOtp,
  verifyOtp,
};
