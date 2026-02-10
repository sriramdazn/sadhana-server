const { SadanaTracker, Sadana } = require('../models');

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getSadanas = async () => {
  return SadanaTracker.find();
};

const getSadanasForLast7Days = async (email) => {
  const today = normalizeDate(new Date());

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  return SadanaTracker.find({
    email,
    date: {
      $gte: sevenDaysAgo,
      $lte: today,
    },
  }).sort({ date: -1 });
};

const addOptedSadana = async (email, date, sadanaId) => {
  const normalizedDate = normalizeDate(date);

  const sadana = await Sadana.findById(sadanaId).lean();

  if (!sadana) {
    throw new Error('Invalid sadanaId');
  }

  const points = sadana.points;

  const existingEntry = await SadanaTracker.findOne({
    email,
    date: normalizedDate,
  });

  if (!existingEntry) {
    return SadanaTracker.create({
      email,
      date: normalizedDate,
      optedSadanas: [sadanaId],
      totalSadhanaPoints: points,
    });
  }

  if (existingEntry.optedSadanas.includes(sadanaId)) {
    return existingEntry;
  }

  return SadanaTracker.findByIdAndUpdate(
    existingEntry._id,
    {
      $addToSet: { optedSadanas: sadanaId },
      $inc: { totalSadhanaPoints: points },
    },
    { new: true }
  );
};

const deleteOptedSadana = async (email, date, sadanaId) => {
  const normalizedDate = normalizeDate(date);

  return SadanaTracker.findOneAndUpdate(
    {
      email,
      date: normalizedDate,
    },
    {
      $pull: { optedSadanas: sadanaId },
    },
    {
      new: true,
    }
  );
};

module.exports = {
  getSadanas,
  getSadanasForLast7Days,
  deleteOptedSadana,
  addOptedSadana,
};
