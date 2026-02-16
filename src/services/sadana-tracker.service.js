const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { SadanaTracker, Sadana } = require('../models');
const ApiError = require('../utils/ApiError');
const { userService } = require('./index');

const normalizeDate = (dateString) => {
  const parts = dateString.split('-');

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const d = new Date(Date.UTC(year, month, day));

  return d.toISOString();
};

const getUserSadanaTracker = async (userId) => {
  const sadanaEntries = SadanaTracker.find({ user: userId }).sort({ date: -1 });
  return sadanaEntries;
};

const getSadanas = async (userId, startDate, endDate) => {
  if (!startDate || !endDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid start or end date');
  }
  const sadanaEntries = SadanaTracker.find({
    user: userId,
    date: {
      $gte: normalizeDate(startDate),
      $lte: normalizeDate(endDate),
    },
  }).sort({ date: -1 });
  return sadanaEntries;
};

const getSadanasForLast7Days = async (userId, date) => {
  const today = normalizeDate(date);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  return SadanaTracker.find({
    user: userId,
    date: {
      $gte: sevenDaysAgo,
      $lte: today,
    },
  }).sort({ date: -1 });
};

const addOptedSadana = async (userId, dateTime, sadanaId) => {
  const normalizedDate = normalizeDate(date);

  const sadanaExists = await Sadana.exists({ _id: sadanaId });

  if (!sadanaExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid sadanaId');
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
    throw new ApiError(httpStatus.BAD_REQUEST, 'Sadana already opted for this date');
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
  const updatedEntry = await SadanaTracker.findOneAndUpdate(
    {
      user: userId,
      date: normalizeDate(date),
    },
    {
      $pull: { optedSadanas: sadanaId },
    },
    {
      new: true,
    }
  );

  if (!updatedEntry) return null;

  if (!updatedEntry.optedSadanas || updatedEntry.optedSadanas.length === 0) {
    await SadanaTracker.deleteOne({ _id: updatedEntry._id });
    return null;
  }

  return updatedEntry;
};

const recalcUserSadhanaPoints = async (userId) => {
  const trackers = await SadanaTracker.find({ user: userId }).lean();

  if (!trackers.length) {
    await userService.updateUserById(userId, { sadhanaPoints: 0 });
    return 0;
  }

  const allSadanaIds = trackers.flatMap((t) => t.optedSadanas);

  if (!allSadanaIds.length) {
    await userService.updateUserById(userId, { sadhanaPoints: 0 });
    return 0;
  }

  const sadanas = await Sadana.find({ _id: { $in: allSadanaIds } })
    .select('_id points')
    .lean();

  const pointsMap = new Map(sadanas.map((s) => [s._id.toString(), s.points]));

  const totalPoints = allSadanaIds.reduce((sum, id) => {
    return sum + (pointsMap.get(id.toString()) || 0);
  }, 0);

  await userService.updateUserById(userId, { sadhanaPoints: totalPoints });

  return totalPoints;
};

const syncUserSadanas = async (userId, data) => {
  const operations = data.map((item) => ({
    updateOne: {
      filter: {
        user: userId,
        date: normalizeDate(item.date),
      },
      update: {
        $addToSet: {
          optedSadanas: {
            $each: item.optedSadanas.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      },
      upsert: true,
    },
  }));

  await SadanaTracker.bulkWrite(operations);

  return { success: true };
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<SadanaTracker>}
 */
const deleteSadanas = async (userId) => {
  const result = await SadanaTracker.deleteMany({ user: userId });
  return result;
};

module.exports = {
  getSadanas,
  getUserSadanaTracker,
  getSadanasForLast7Days,
  deleteOptedSadana,
  addOptedSadana,
  recalcUserSadhanaPoints,
  syncUserSadanas,
  deleteSadanas,
};
