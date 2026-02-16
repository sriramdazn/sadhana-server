const httpStatus = require('http-status');
// eslint-disable-next-line import/no-unresolved
const { v6: uuid6 } = require('uuid');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { Token, Otp } = require('../models');

/**
 * Save OTP
 * @param {string} email
 * @param {string} otp
 * @return {Promise<Otp>}
 */
const saveOtp = async (email, otp) => {
  const otpId = uuid6();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const otpRecord = await Otp.create({ email, otp, otpId, expiresAt });
  return otpRecord;
};

/**
 * Verify otpId
 * @param {string} otpId
 * @param {string} otp
 * @returns {Promise<Otp>}
 */

const verifyOtp = async (otpId, otp) => {
  if (!/^\d{4}$/.test(otp)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP must be a 4-digit number');
  }
  const validateUser = await Otp.findOne({ otpId, otp });
  if (!validateUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP');
  }

  if (validateUser.expiresAt < new Date()) {
    await Otp.deleteOne({ otpId });
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP expired');
  }
  await Otp.deleteOne({ _id: validateUser.id });
  return validateUser;
};

/**
 * Logout
 * @param {string} userId
 * @returns {Promise}
 */
const logout = async (userId) => {
  const accessTokenDoc = await Token.findOneAndDelete({ user: userId, type: tokenTypes.ACCESS, blacklisted: false });
  if (!accessTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Token not found / User already logged out');
  }
};

module.exports = {
  saveOtp,
  verifyOtp,
  logout,
};
