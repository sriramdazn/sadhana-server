const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const sadanaSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    points: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
sadanaSchema.plugin(toJSON);
sadanaSchema.plugin(paginate);

/**
 * @typedef Sadana
 */
const Sadana = mongoose.model('Sadana', sadanaSchema);

module.exports = Sadana;
