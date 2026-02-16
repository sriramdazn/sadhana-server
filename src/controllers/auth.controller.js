const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService, sadanaTrackerService } = require('../services');
const { generateOtp } = require('../utils/util');

const requestOtpForEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  // const otp = generateOtp();
  const otp = 1234;
  const savedOtp = await authService.saveOtp(email, otp);
  // await emailService.sendEmail(email, 'Email Verification', `Your verification code is ${otp}`);
  res.status(httpStatus.OK).send({ otpId: savedOtp.otpId, message: 'Verification OTP sent to email' });
});

const verifyOtpAndAuthenticate = catchAsync(async (req, res) => {
  const { otpId, otp, sadanas, sadhanaPoints, decayPoints } = req.body;

  const validatedOtp = await authService.verifyOtp(otpId, otp);

  let user = await userService.getUserByEmail(validatedOtp.email);

  if (!user) {
    user = await userService.createUser({
      email: validatedOtp.email,
      isEmailVerified: true,
      sadhanaPoints,
      decayPoints,
    });
  }
  const tokens = await tokenService.generateAuthTokens(user);
  if (sadanas && sadanas.length > 0) {
    await sadanaTrackerService.syncUserSadanas(user.id, sadanas);
  }
  res.status(httpStatus.OK).send(tokens);
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.user.id);
  res.status(httpStatus.OK).send({ message: 'Logged out successfully' });
});

module.exports = {
  requestOtpForEmail,
  verifyOtpAndAuthenticate,
  logout,
};
