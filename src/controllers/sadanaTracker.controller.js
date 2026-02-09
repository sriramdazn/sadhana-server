const httpStatus = require('http-status');
const { User, Sadana, SadanaTracker } = require('../models');
const {
  getSadanas,
  getSadanasForLast7Days,
  deleteOptedSadana: deleteSadanaTrackerEntry,
  addOptedSadana: addSadanaTrackerEntry,
} = require('../services/sadanaTracker.service');

const getFullSadanaTracker = async (req, res) => {
  const sadhanas = await getSadanas();

  res.status(httpStatus.OK).json({
    data: sadhanas,
  });
};

const getSadanaTrackerForLast7Days = async (req, res) => {
  const sadhanas = await getSadanasForLast7Days(req.body.email);

  res.status(httpStatus.OK).json({
    data: sadhanas,
  });
};

const recalcUserSadhanaPoints = async (email) => {
  const trackers = await SadanaTracker.find({ email }).lean();

  if (!trackers.length) return 0;

  const allSadanaIds = trackers.flatMap((t) => t.optedSadanas);

  if (!allSadanaIds.length) return 0;

  const sadanas = await Sadana.find({ _id: { $in: allSadanaIds } }).lean();

  const pointsMap = new Map(sadanas.map((s) => [s._id.toString(), s.points]));

  const totalPoints = allSadanaIds.reduce((sum, id) => {
    const pts = pointsMap.get(id.toString()) || 0;
    return sum + pts;
  }, 0);

  await User.findOneAndUpdate({ email }, { sadhanaPoints: totalPoints });

  return totalPoints;
};

const addOptedSadana = async (req, res) => {
  const { email, date, sadanaId } = req.body;

  const updatedEntry = await addSadanaTrackerEntry(email, date, sadanaId);

  const totalPoints = await recalcUserSadhanaPoints(email);

  res.status(httpStatus.OK).json({
    message: 'Opted Sadana added successfully',
    data: updatedEntry,
    totalSadhanaPoints: totalPoints,
  });
};

const deleteOptedSadana = async (req, res) => {
  const { email, date, sadanaId } = req.body;

  const updatedEntry = await deleteSadanaTrackerEntry(email, date, sadanaId);

  const totalPoints = await recalcUserSadhanaPoints(email);

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
