const { Sadana } = require('../models');

const getSadanas = async () => {
  return Sadana.find();
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
