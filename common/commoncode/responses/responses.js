const als = require("async-local-storage");
const constants = require("commonconstants");
const { ApplicationErrorMessage } = require("dcp-errors");
const logger = require("dcp-logger");

exports.buildServiceResponse = (response) => {
  let serviceResponse;
  if (response) {
    serviceResponse = response;
  } else {
    serviceResponse = {};
  }
  serviceResponse.correlationId = als.get(constants.KEY_CORRELATION_ID);
  serviceResponse.statusCode = 200;
  serviceResponse.statusReason = "OK";
  serviceResponse.success = true;
  return serviceResponse;
};

function processModelValidationErrors(exception) {
  let messages = [];
  let errorDetails = exception.errors;
  Object.keys(errorDetails).forEach((errorField) => {
    const errorFieldDetails = errorDetails[errorField];
    messages.push(
      new ApplicationErrorMessage(
        errorFieldDetails.message + " at path " + errorFieldDetails.path
      )
    );
  });
  return messages;
}

function processModelDuplicateKeyErrors(exception) {
  let messages = [];
  let errorDetails = exception.keyValue;
  Object.keys(errorDetails).forEach((key) => {
    if (key !== constants.SCHEMA_TENANT) {
      const value = errorDetails[key];
      messages.push(
        new ApplicationErrorMessage(value + " already exists at path " + key)
      );
    }
  });
  return messages;
}

exports.buildExceptionResponse = (exception) => {
  let exceptionResponse = {};
  exceptionResponse.correlationId = als.get(constants.KEY_CORRELATION_ID);
  exceptionResponse.success = false;
  if (exception.name === "ApplicationException") {
    exceptionResponse.statusCode = 600;
    exceptionResponse.statusReason = "Bad Request";
    exceptionResponse.messages = exception.messages;
  } else if (exception.name === "NotFound") {
    exceptionResponse.statusCode = 604;
    exceptionResponse.statusReason = "Not Found";
    exceptionResponse.message = "Request path not found";
  } else if (exception.name === "RecordsNotFoundException") {
    exceptionResponse.success = true;
    exceptionResponse.statusCode = 605;
    exceptionResponse.statusReason = "Not Found";
    exceptionResponse.message = "Records not found";
  } else {
    // Do this here so that there is a guaranteed logging of all exception responses
    let cause;
    if (exception.cause) {
      cause = exception.cause;
    } else {
      cause = exception;
    }
    if (cause.name === "ValidationError" && cause.errors) {
      exceptionResponse.statusCode = 600;
      exceptionResponse.statusReason = "Bad Request";
      exceptionResponse.messages = processModelValidationErrors(cause);
    } else if (cause.name === "MongoError" && cause.code === 11000) {
      exceptionResponse.statusCode = 600;
      exceptionResponse.statusReason = "Bad Request";
      exceptionResponse.messages = processModelDuplicateKeyErrors(cause);
    } else if (
      cause instanceof SyntaxError &&
      cause.status === 400 &&
      cause.type === "entity.parse.failed" &&
      "body" in cause
    ) {
      exceptionResponse.success = false;
      exceptionResponse.statusCode = 600;
      exceptionResponse.statusReason = "Bad Request";
      exceptionResponse.message = exception.message;
    } else {
      logger.error(cause.stack);
      exceptionResponse.statusCode = 500;
      exceptionResponse.statusReason = "Internal Server Error";
      exceptionResponse.message = exception.message;
    }
  }
  return exceptionResponse;
};
