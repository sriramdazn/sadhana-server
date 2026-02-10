const httpStatus = require('http-status');
const { getSadanas, createSadana, deleteAllSadanas } = require('../services/sadana.service');

const listSadanas = async (req, res) => {
  const sadhanas = await getSadanas();

  res.status(httpStatus.OK).json({
    data: sadhanas,
  });
};

const addSadana = async (req, res) => {
  const sadhana = await createSadana(req.body);

  res.status(httpStatus.CREATED).json({
    message: 'Sadhana created successfully',
    data: sadhana,
  });
};

const deleteSadanas = async (req, res) => {
  await deleteAllSadanas();
  res.status(httpStatus.OK).json({
    message: 'Sadhanas deleted successfully',
  });
};

module.exports = {
  listSadanas,
  addSadana,
  deleteSadanas,
};
