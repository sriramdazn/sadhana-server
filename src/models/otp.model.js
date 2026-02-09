const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },
    otpId: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
otpSchema.plugin(toJSON);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * @typedef Otp
 */
const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
