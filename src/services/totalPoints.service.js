const mongoose = require('mongoose');
const { SadanaTracker } = require('../models');

const getTotalPoints = async (userId) => {
  const totalPoints = await SadanaTracker.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        totalPoints: { $sum: '$points' },
      },
    },
  ]);

  return totalPoints;
};

module.exports = {
  getTotalPoints,
};
