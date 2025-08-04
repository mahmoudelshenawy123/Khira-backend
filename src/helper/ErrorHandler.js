const { default: mongoose } = require('mongoose');
const { ResponseSchema } = require('./HelperFunctions');

exports.ErrorHandler = (err) => {
  const errors = [];
  if (err?.message?.includes('validation failed')) {
    Object.keys(err?.errors).map((key) => {
      errors.push({ [key]: err?.errors?.[key].message });
    });
  }
  if (err?.code == 11000) {
    errors.push({ email: 'Email already exists' });
  }
  return errors;
};

exports.CheckValidIdObject = (req, res, id, message = '') => {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json(ResponseSchema(message, false));
    return false;
  }
  return true;
};
exports.checkAuthorization = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json(ResponseSchema('Unauthorized', false));
  }
  next(err);
};

/*
  Catch Errors Handler
*/

exports.catchErrors = (fn) => function (req, res, next) {
  fn(req, res, next).catch((err) => {
    // Validation Errors
    if (typeof err === 'string') {
      res.status(400).json({
        message: err,
      });
    } else {
      next(err);
    }
  });
};

/*
    MongoDB `Validation` Error Handler

    Detect if there are mongodb validation errors that we send them nicely back.
  */

exports.mongoseErrors = (err, req, res, next) => {
  const errors = [];

  console.log(err);
  console.log(err?.keyPattern);
  if (err.message.includes('validation failed')) {
    Object.keys(err.errors).map((key) => {
      errors.push({ [key]: err.errors[key].message });
    });
  }
  if (err.code == 11000) {
    console.log(err?.keyPattern);
    errors.push({ email: 'Email already exists', errors });
  }
  return errors;
};

/*
    Development Error Handler

    In development we show good error messages so if we hit a syntax error or any other previously un-handled error, we can show good info on what happened
  */
exports.developmentErrors = (err, req, res, next) => {
  err.stack = err.stack || '';
  const errorDetails = {
    message: err.message,
    status: err.status,
    stack: err.stack,
  };

  res.status(err.status || 500).json(errorDetails); // send JSON back
};

/*
    Production Error Handler

    No stacktraces and error details are leaked to user
  */
exports.productionErrors = (err, req, res, next) => {
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
  }); // send JSON back
};

/*
  404 Page Error
  */

exports.notFound = (req, res, next) => {
  res.status(404).json({
    message: 'Route not found',
  });
};
