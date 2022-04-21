const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const als = require("async-local-storage");
const { v4: uuidv4 } = require("uuid");

const config = require("dcp-config");
const constants = require("commonconstants");
const logger = require("dcp-logger");
const morgan = require("morgan");
const { buildExceptionResponse } = require("dcp-responses");
const { ApplicationException } = require("dcp-errors");
const swaggerUi = require("swagger-ui-express");

const API_DOCS = "/api-docs";

function loadExpressJS(routes, swaggerDocument) {
  const app = express();

  // URL's for service health check
  app.get("/status", (req, res) => {
    res.status(200).end();
  });
  app.get("/live", (req, res) => {
    res.status(200).end();
  });

  app.options("/*", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "*");
    res.status(200).end();
  });

  // Get tenant from the request and set it in the async local storage
  als.enable();
  if (config.getProperty("dcp.controller.requestlogger.autoconfig", false)) {
    app.use(morgan(config.getProperty("dcp.controller.requestlogger.mode")));
  }
  app.use((req, res, next) => {
    const tenant = req.headers[constants.KEY_TENANT];
    if (!tenant) {
      if (req.url.includes(API_DOCS)) {
        next();
      } else {
        next(
          new ApplicationException(constants.ERROR_TENANT_HEADER_NOT_PROVIDED)
        );
      }
    } else {
      if (tenant !== constants.CAESARS) {
        next(new ApplicationException(constants.ERROR_TENANT_IS_NOT_CORRECT));
      }
      als.scope();
      let correlationId = req.headers[constants.KEY_CORRELATION_ID];
      if (!correlationId) {
        correlationId = uuidv4();
      }
      als.set(constants.KEY_CORRELATION_ID, correlationId);
      als.set(constants.KEY_TENANT, tenant);
      next();
    }
  });
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(config.getProperty("api.prefix", "/api"), routes());

  if (typeof swaggerDocument !== "undefined") {
    var options = {
      explorer: true,
    };
    app.use(
      API_DOCS,
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, options)
    );
  }

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    let notFoundError = new Error();
    notFoundError.name = "NotFound";
    next(notFoundError);
  });

  // error handler (fail safe in case exceptions are missed in service code but should not be required in correctly implemented services
  app.use((error, req, res, next) => {
    const exceptionResponse = buildExceptionResponse(error);
    logger.error(JSON.stringify(exceptionResponse));
    return res.json({
      success: exceptionResponse.success,
      statusCode: exceptionResponse.statusCode,
      message: exceptionResponse.statusReason,
    });
  });

  const router = express.Router();
  app.use("/", router);

  logger.info("Express framework configured ...");

  return app;
}

function startExpressJS(app) {
  const port = config.getProperty("server.port", 8080);
  app.listen(port, (err) => {
    if (err) {
      logger.error(err);
      process.exit(1);
      return;
    }
    logger.info("##################################################");
    logger.info(`@@@ Server started and listening on port: ${port} @@@`);
    logger.info("##################################################");
  });
}

module.exports = { loadExpressJS, startExpressJS };
