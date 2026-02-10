const { User, SadanaTracker, Sadana } = require('../models');

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getSadanas = async () => {
  return SadanaTracker.find();
};

const getSadanasForLast7Days = async (userId) => {
  const today = normalizeDate(new Date());

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  return SadanaTracker.find({
    user: userId,
    date: {
      $gte: sevenDaysAgo,
      $lte: today,
    },
  }).sort({ date: -1 });
};

const addOptedSadana = async (userId, date, sadanaId) => {
  const normalizedDate = normalizeDate(date);

  const sadanaExists = await Sadana.exists({ _id: sadanaId });
  if (!sadanaExists) {
    throw new Error('Invalid sadanaId');
  }

  const existingEntry = await SadanaTracker.findOne({
    user: userId,
    date: normalizedDate,
  });

  if (!existingEntry) {
    return SadanaTracker.create({
      user: userId,
      date: normalizedDate,
      optedSadanas: [sadanaId],
    });
  }

  if (existingEntry.optedSadanas.includes(sadanaId)) {
    return existingEntry;
  }

  return SadanaTracker.findByIdAndUpdate(
    existingEntry._id,
    {
      $addToSet: { optedSadanas: sadanaId },
    },
    { new: true }
  );
};

const deleteOptedSadana = async (userId, date, sadanaId) => {
  const normalizedDate = normalizeDate(date);

  return SadanaTracker.findOneAndUpdate(
    {
      user: userId,
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

const recalcUserSadhanaPoints = async (userId) => {
  const trackers = await SadanaTracker.find({ user: userId }).lean();

  if (!trackers.length) {
    await User.findByIdAndUpdate(userId, { sadhanaPoints: 0 });
    return 0;
  }

  const allSadanaIds = trackers.flatMap((t) => t.optedSadanas);

  if (!allSadanaIds.length) {
    await User.findByIdAndUpdate(userId, { sadhanaPoints: 0 });
    return 0;
  }

  const sadanas = await Sadana.find({ _id: { $in: allSadanaIds } })
    .select('_id points')
    .lean();

  const pointsMap = new Map(
    sadanas.map((s) => [s._id.toString(), s.points])
  );

  const totalPoints = allSadanaIds.reduce((sum, id) => {
    return sum + (pointsMap.get(id.toString()) || 0);
  }, 0);

  await User.findByIdAndUpdate(userId, { sadhanaPoints: totalPoints });

  return totalPoints;
};

module.exports = {
  getSadanas,
  getSadanasForLast7Days,
  deleteOptedSadana,
  addOptedSadana,
  recalcUserSadhanaPoints,
};
