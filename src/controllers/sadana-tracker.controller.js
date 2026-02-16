const httpStatus = require('http-status');
const { sadanaTrackerService } = require('../services');

const getFullSadanaTracker = async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.body;
  const sadhanas = await sadanaTrackerService.getSadanas(userId, startDate, endDate);

  res.status(httpStatus.OK).send({
    data: sadhanas,
  });
};

const addOptedSadana = async (req, res) => {
  const userId = req.user.id;
  const { dateTime, sadanaId } = req.body;

  const updatedEntry = await sadanaTrackerService.addOptedSadana(userId, dateTime, sadanaId);

  const totalPoints = await sadanaTrackerService.recalcUserSadhanaPoints(userId);

  res.status(httpStatus.OK).send({
    message: 'Sadana Opted Successfully',
    data: updatedEntry,
    totalSadhanaPoints: totalPoints,
  });
};

const deleteOptedSadana = async (req, res) => {
  const userId = req.user.id;
  const { dateTime, sadanaId } = req.body;

  const updatedEntry = await sadanaTrackerService.deleteOptedSadana(userId, dateTime, sadanaId);

  const totalPoints = await sadanaTrackerService.recalcUserSadhanaPoints(userId);

  res.status(httpStatus.OK).send({
    message: 'Opted Sadana Deleted Successfully',
    data: updatedEntry,
    totalSadhanaPoints: totalPoints,
  });
};

module.exports = {
  getFullSadanaTracker,
  addOptedSadana,
  deleteOptedSadana,
};
