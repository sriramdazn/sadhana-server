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

const normalizeDateTime = (dateTimeString) => {
  const normalizedDateTime = new Date(dateTimeString);
  if (Number.isNaN(normalizedDateTime.getTime())) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid dateTime');
  }

  return normalizedDateTime;
};

const getUserSadanaTracker = async (userId) => {
  const sadanaEntries = await SadanaTracker.find({ user: userId }).sort({ date: -1 });
  return sadanaEntries;
};

const querySadanas = async (userId, options) => {
  const filter = { user: userId };
  const sadanas = await SadanaTracker.paginate(filter, options);
  return sadanas;
};

const addOptedSadana = async (userId, dateTime, sadanaId) => {
  const normalizedDateTime = normalizeDateTime(dateTime);
  const dateOnly = normalizeDate(dateTime);

  const sadanaExists = await Sadana.findById(sadanaId);
  if (!sadanaExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid sadanaId');
  }

  const existingEntry = await SadanaTracker.findOne({
    user: userId,
    date: dateOnly,
  });

  const sadanaObject = {
    sadana: sadanaId,
    dateTime: normalizedDateTime,
  };

  if (!existingEntry) {
    return SadanaTracker.create({
      user: userId,
      date: dateOnly,
      optedSadanas: [sadanaObject],
    });
  }

  return SadanaTracker.findByIdAndUpdate(
    existingEntry._id,
    {
      $push: { optedSadanas: sadanaObject },
    },
    { new: true }
  );
};

const deleteOptedSadana = async (userId, dateTime, sadanaId) => {
  const normalizedDateTime = normalizeDateTime(dateTime);
  const dateOnly = normalizeDate(dateTime);

  const updatedEntry = await SadanaTracker.findOneAndUpdate(
    {
      user: userId,
      date: dateOnly,
    },
    {
      $pull: {
        optedSadanas: {
          sadana: sadanaId,
          dateTime: normalizedDateTime,
        },
      },
    },
    { new: true }
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

  const allSadanaIds = trackers.flatMap((t) => t.optedSadanas.map((entry) => entry.sadana.toString()));

  if (!allSadanaIds.length) {
    await userService.updateUserById(userId, { sadhanaPoints: 0 });
    return 0;
  }

  const sadanas = await Sadana.find({ _id: { $in: allSadanaIds } })
    .select('_id points')
    .lean();

  const pointsMap = new Map(sadanas.map((s) => [s._id.toString(), s.points]));

  const totalPoints = allSadanaIds.reduce((sum, id) => {
    return sum + (pointsMap.get(id) || 0);
  }, 0);

  await userService.updateUserById(userId, { sadhanaPoints: totalPoints });

  return totalPoints;
};

const syncUserSadanas = async (userId, sadanas) => {
  const groupedByDate = {};

  sadanas.forEach((entry) => {
    const dateOnly = normalizeDate(entry.dateTime);

    if (!groupedByDate[dateOnly]) {
      groupedByDate[dateOnly] = [];
    }

    groupedByDate[dateOnly].push({
      sadana: new mongoose.Types.ObjectId(entry.sadanaId),
      dateTime: new Date(entry.dateTime),
    });
  });

  const operations = Object.keys(groupedByDate).map((date) => ({
    updateOne: {
      filter: { user: userId, date: new Date(date) },
      update: {
        $push: {
          optedSadanas: { $each: groupedByDate[date] },
        },
      },
      upsert: true,
    },
  }));

  await SadanaTracker.bulkWrite(operations);
  await recalcUserSadhanaPoints(userId);

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
  querySadanas,
  getUserSadanaTracker,
  addOptedSadana,
  deleteOptedSadana,
  recalcUserSadhanaPoints,
  syncUserSadanas,
  deleteSadanas,
};
