const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { sadanaService } = require('../services');

const listSadanas = catchAsync(async (req, res) => {
  const sadhanas = await sadanaService.getSadanas();
  res.status(httpStatus.OK).send({
    sadanas: sadhanas,
  });
});

const addSadana = catchAsync(async (req, res) => {
  const sadhana = await sadanaService.createSadana(req.body);
  res.status(httpStatus.CREATED).send({
    message: 'Sadhana created successfully',
    data: sadhana,
  });
});

const deleteSadanas = catchAsync(async (req, res) => {
  await sadanaService.deleteAllSadanas();
  res.status(httpStatus.OK).send({
    message: 'Sadhanas deleted successfully',
  });
});

module.exports = {
  listSadanas,
  addSadana,
  deleteSadanas,
};
