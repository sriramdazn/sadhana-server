/* eslint-disable no-param-reassign */

const logger = require('../../config/logger');

/**
 * A mongoose schema plugin which applies the following in the toJSON transform call:
 *  - removes __v, createdAt, updatedAt, and any path that has private: true
 *  - replaces _id with id
 */

const deleteAtPath = (obj, path, index) => {
  if (index === path.length - 1) {
    delete obj[path[index]];
    return;
  }
  deleteAtPath(obj[path[index]], path, index + 1);
};

const serializeValue = (value) => {
  // Handle ObjectId instances safely
  if (value && typeof value === 'object' && value._bsontype === 'ObjectId') {
    try {
      return value.toString();
    } catch (err) {
      // If toString() fails, try to return the id property or empty string
      return value.id || '';
    }
  }
  if (value && typeof value === 'object' && value.toHexString && typeof value.toHexString === 'function') {
    try {
      return value.toHexString();
    } catch (err) {
      return value.id || '';
    }
  }
  return value;
};

const transformNestedIds = (obj) => {
  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      if (item && typeof item === 'object') {
        // Transform all keys in the item
        Object.keys(item).forEach((key) => {
          const value = item[key];
          // Handle ObjectId instances that are not _id
          if (
            value &&
            typeof value === 'object' &&
            (value._bsontype === 'ObjectId' || (value.toHexString && typeof value.toHexString === 'function'))
          ) {
            try {
              item[key] = serializeValue(value);
            } catch (err) {
              // If serialization fails, convert to string representation
              item[key] = String(value);
            }
          } else if (value && typeof value === 'object' && !Array.isArray(value) && value._bsontype !== 'ObjectId') {
            transformNestedIds(value);
          }
        });
        // Transform _id to id
        if (item._id) {
          try {
            item.id = serializeValue(item._id);
          } catch (err) {
            item.id = String(item._id);
          }
          delete item._id;
        }
      }
    });
  } else if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (value._id) {
          try {
            value.id = serializeValue(value._id);
          } catch (err) {
            value.id = String(value._id);
          }
          delete value._id;
        }
        if (value._bsontype === 'ObjectId' || (value.toHexString && typeof value.toHexString === 'function')) {
          try {
            obj[key] = serializeValue(value);
          } catch (err) {
            obj[key] = String(value);
          }
        } else {
          transformNestedIds(value);
        }
      } else if (Array.isArray(value)) {
        transformNestedIds(value);
      }
    });
  }
};

const toJSON = (schema) => {
  let transform;
  if (schema.options.toJSON && schema.options.toJSON.transform) {
    transform = schema.options.toJSON.transform;
  }

  schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
    transform(doc, ret, options) {
      Object.keys(schema.paths).forEach((path) => {
        if (schema.paths[path].options && schema.paths[path].options.private) {
          deleteAtPath(ret, path.split('.'), 0);
        }
      });

      try {
        ret.id = ret._id.toString();
      } catch (err) {
        ret.id = ret._id;
      }
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;

      // Transform nested _id fields to id
      try {
        transformNestedIds(ret);
      } catch (err) {
        // If transformNestedIds fails, just continue without transforming nested ids
        logger.error('Error transforming nested IDs:', err.message);
      }

      if (transform) {
        return transform(doc, ret, options);
      }
    },
  });
};

module.exports = toJSON;
