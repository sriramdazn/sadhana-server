const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const sadanaTrackerSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  date: {
    type: Date,
    required: true,
    index: true,
  },

  optedSadanas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sadana',
    },
  ],
});

sadanaTrackerSchema.index({ user: 1, date: 1 }, { unique: true });

sadanaTrackerSchema.plugin(toJSON);
sadanaTrackerSchema.plugin(paginate);

/**
 * @typedef SadanaTracker
 */
const SadanaTracker = mongoose.model('SadanaTracker', sadanaTrackerSchema);

module.exports = SadanaTracker;
