const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { generateOtp } = require('../utils/util');

const registerRequestOtp = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (await User.isEmailTaken(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  const otp = generateOtp();
  const savedOtp = await authService.saveOtp(email, otp);
  await emailService.sendEmail(email, 'Email Verification', `Your verification code is ${otp}`);
  res.status(httpStatus.OK).send({ otpId: savedOtp.otpId, message: 'Verification OTP sent to email' });
});

const verifyRegisterOtp = catchAsync(async (req, res) => {
  const { otpId, otp } = req.body;
  const validateUser = await authService.verifyOtp(otpId, otp);
  const user = await userService.createUser({ email: validateUser.email, isEmailVerified: true });
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, ...tokens });
});

const loginRequestOtp = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const otp = generateOtp();
  const savedOtp = await authService.saveOtp(email, otp);
  await emailService.sendEmail(email, 'Email Verification', `Your verification code is ${otp}`);
  res.status(httpStatus.OK).send({ otpId: savedOtp.otpId, message: 'Verification OTP sent to email' });
});

const verifyLoginOtp = catchAsync(async (req, res) => {
  const { otpId, otp } = req.body;
  const validateOtp = await authService.verifyOtp(otpId, otp);
  const user = await userService.getUserByEmail(validateOtp.email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).send(tokens);
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.accessToken);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  registerRequestOtp,
  loginRequestOtp,
  logout,
  verifyRegisterOtp,
  verifyLoginOtp,
};
