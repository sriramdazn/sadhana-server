const httpStatus = require('http-status');
const pick = require('../utils/pick');
const { sadanaTrackerService } = require('../services');

const getFullSadanaTracker = async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const sadhanas = await sadanaTrackerService.querySadanas(userId, startDate, endDate, options);
  if (!sadhanas.results || sadhanas.results.length === 0) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'No sadanas found for the user' });
  }
  res.status(httpStatus.OK).send(sadhanas);
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
