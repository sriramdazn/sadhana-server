const Joi = require('joi');

const userAuth = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
};

const logout = {
  body: Joi.object().keys({
    accessToken: Joi.string().required(),
  }),
};

const verifyEmail = {
  body: Joi.object().keys({
    otpId: Joi.string().required(),
    otp: Joi.number().required(),
    sadanas: Joi.array(),
  }),
};

module.exports = {
  userAuth,
  logout,
  verifyEmail,
};
