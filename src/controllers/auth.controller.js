const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, tokenService, emailService } = require('../services');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

const register = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (await User.isEmailTaken(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await authService.saveOtp(email, otp);
  await emailService.sendEmail(email, 'Email Verification', `Your verification code is ${otp}`);
  res.status(httpStatus.OK).send({ message: 'Verification OTP sent to email' });
});

const verifyRegisterOtp = catchAsync(async (req, res) => {
  const { otpId, otp } = req.body;
  const validateUser = await authService.verifyOtp(otpId, otp);
  const user = await User.create({ email: validateUser.email, isEmailVerified: true });
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, ...tokens });
});

const login = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await authService.loginUserWithEmailOtp(email);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const verifyLoginOtp = catchAsync(async (req, res) => {
  const { otpId, otp } = req.body;
  const validateUser = await authService.verifyOtp(otpId, otp);
  const tokens = await tokenService.generateAuthTokens(validateUser);
  res.status(httpStatus.OK).send({ user: validateUser, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  sendVerificationEmail,
  verifyRegisterOtp,
  verifyLoginOtp,
};
