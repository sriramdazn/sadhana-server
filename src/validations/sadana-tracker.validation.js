const Joi = require('joi');

const getUserSadanaTracker = {
  query: Joi.object().keys({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const addOptedSadana = {
  body: Joi.object().keys({
    dateTime: Joi.date().iso().required(),
    sadanaId: Joi.string().required(),
  }),
};

const deleteOptedSadana = {
  body: Joi.object().keys({
    dateTime: Joi.date().iso().required(),
    sadanaId: Joi.string().required(),
  }),
};

module.exports = {
  getUserSadanaTracker,
  addOptedSadana,
  deleteOptedSadana,
};
