const Joi = require('joi');

const userAuth = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    otpId: Joi.string().required(),
    otp: Joi.number().required(),
  }),
};

module.exports = {
  userAuth,
  logout,
  verifyEmail,
};
