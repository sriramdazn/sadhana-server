const httpStatus = require('http-status');
const { Sadana } = require('../models');
const ApiError = require('../utils/ApiError');

const getSadanas = async () => {
  const sadanas = await Sadana.find();
  if (!sadanas || sadanas.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No sadhanas found');
  }
  return sadanas;
};

const createSadana = async (data) => {
  return Sadana.create(data);
};

const deleteAllSadanas = async () => {
  return Sadana.deleteMany({});
};

module.exports = {
  getSadanas,
  createSadana,
  deleteAllSadanas,
};
