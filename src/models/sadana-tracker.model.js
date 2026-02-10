const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const sadanaTrackerSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    optedSadanas: {
      type: [Number],
      default: [],
    },
  }
);

// ✅ Ensure one entry per user per day
sadanaTrackerSchema.index({ email: 1, date: 1 }, { unique: true });

sadanaTrackerSchema.plugin(toJSON);
sadanaTrackerSchema.plugin(paginate);

/**
 * @typedef SadanaTracker
 */
const SadanaTracker = mongoose.model('SadanaTracker', sadanaTrackerSchema);

module.exports = SadanaTracker;
