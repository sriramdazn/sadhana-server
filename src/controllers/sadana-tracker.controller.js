const httpStatus = require('http-status');
const { sadanaTrackerService } = require('../services');

const getFullSadanaTracker = async (req, res) => {
  const sadhanas = await sadanaTrackerService.getSadanas();

  res.status(httpStatus.OK).json({
    data: sadhanas,
  });
};

const getSadanaTrackerForLast7Days = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.body;

  const sadhanas = await sadanaTrackerService.getSadanasForLast7Days(userId, date);

  res.status(httpStatus.OK).json({
    data: sadhanas,
  });
};

const addOptedSadana = async (req, res) => {
  const userId = req.user.id;
  const { date, sadanaId } = req.body;

  const updatedEntry =
    await sadanaTrackerService.addOptedSadana(userId, date, sadanaId);

  const totalPoints = await sadanaTrackerService.recalcUserSadhanaPoints(userId);

  res.status(httpStatus.OK).json({
    message: 'Opted Sadana added successfully',
    data: updatedEntry,
    totalSadhanaPoints: totalPoints,
  });
};

const deleteOptedSadana = async (req, res) => {
  const userId = req.user.id;
  const { date, sadanaId } = req.body;

  const updatedEntry =
    await sadanaTrackerService.deleteOptedSadana(userId, date, sadanaId);

  const totalPoints = await sadanaTrackerService.recalcUserSadhanaPoints(userId);

  res.status(httpStatus.OK).json({
    message: 'Opted Sadana deleted successfully',
    data: updatedEntry,
    totalSadhanaPoints: totalPoints,
  });
};

module.exports = {
  getFullSadanaTracker,
  getSadanaTrackerForLast7Days,
  addOptedSadana,
  deleteOptedSadana,
};
