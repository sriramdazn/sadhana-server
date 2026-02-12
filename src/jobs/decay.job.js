// eslint-disable-next-line import/no-extraneous-dependencies
const cron = require('node-cron');
const User = require('../models/user.model');
const logger = require('../config/logger');

const startDecayJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      await User.updateMany({}, [{ $set: { sadhanaPoints: { $add: ['$sadhanaPoints', '$decayPoints'] } } }]);
    } catch (error) {
      logger.error('Decay', error);
    }
  });
};

module.exports = startDecayJob;
