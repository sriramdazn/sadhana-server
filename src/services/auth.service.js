const httpStatus = require('http-status');
// eslint-disable-next-line import/no-unresolved
const { v6: uuid6 } = require('uuid');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { Otp } = require('../models');

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
 * @param {string} accessToken
 * @returns {Promise}
 */
const logout = async (accessToken) => {
  const accessTokenDoc = await Token.findOne({ token: accessToken, type: tokenTypes.ACCESS, blacklisted: false });
  if (!accessTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await accessTokenDoc.remove();
};

module.exports = {
  saveOtp,
  verifyOtp,
  logout,
};
