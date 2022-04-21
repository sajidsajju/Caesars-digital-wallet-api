const { IndividualService } = require("../service/individual.service");
const { ApplicationException } = require("dcp-errors");
const constants = require("commonconstants");
const { getArrayParameter, getBooleanParameter } = require("dcp-routes");
const logger = require("dcp-logger");

function validateContentType(req, res, next) {
  if (!req.is("application/json")) {
    throw new ApplicationException(
      constants.ERROR_CONTENT_TYPE_HEADER_VALUE_INVALID
    );
  }
  next();
}

module.exports = (app) => {
  this.individualService = new IndividualService();

  // Create a new Customer
  app.post("/v1/individual", validateContentType, (req, res, next) => {
    logger.info("[IndividualRoute]:Entered Route create individual");
    this.individualService
      .createIndividual(req.body)
      .then((data) => res.send(data))
      .catch((error) => next(error));
  });

  // Retrieve all Customers
  app.get("/v1/individual/all", (req, res, next) => {
    logger.info("[IndividualRoute]:Entered Route get individual");
    let retrieveInactive = getBooleanParameter(req.query.retrieveInactive);
    this.individualService
      .findAllIndividuals(retrieveInactive)
      .then((data) => res.send(data))
      .catch((error) => next(error));
  });

  // Retrieve Individual by UID
  app.get("/v1/individual/:uid", (req, res, next) => {
    logger.info("[IndividualRoute]:Entered Route get individual by uid");
    let uid = req.params.uid;
    this.individualService
      .findIndividualbyUID(uid)
      .then((data) => res.send(data))
      .catch((error) => next(error));
  });

  // Create a new Customer Account Association
  app.post("/v1/individual/partner/association", (req, res, next) => {
    logger.info(
      "[IndividualRoute]: Entered Route associate individual with partner account"
    );
    this.individualService
      .individualPartnerAssociation(req.body)
      .then((data) => res.send(data))
      .catch((error) => next(error));
  });

  //Retrieve individual identification instruments by uid
  app.get("/v1/individual/identificationinstruments/:uid", (req, res, next) => {
    logger.info(
      "[IndividualRoute]:Entered Route get individual/identificationinstruments by uid"
    );
    this.individualService
      .getIdentificationInstrumentsbyUID(req.params.uid)
      .then((data) => res.send(data))
      .catch((error) => next(error));
  });

  //Retrieve individual by identification instruments
  app.post(
    "/v1/individual/retrieve/identificationinstrument",
    validateContentType,
    (req, res, next) => {
      logger.info(
        "[IndividualRoute]: Entered Route get individual by identificationInstrument"
      );
      this.individualService
        .getIndividualbyIdentificationInstrument(req.body)
        .then((data) => res.send(data))
        .catch((error) => next(error));
    }
  );

  app.post(
    "/v1/individual/retrieve/contactmethod",
    validateContentType,
    (req, res, next) => {
      logger.info(
        "[IndividualRoute]: Entered Route get individual by contactMethod"
      );
      this.individualService
        .getIndividualByContactMethod(req.body)
        .then((data) => res.send(data))
        .catch((error) => next(error));
    }
  );

  //Update an existing customer
  app.post("/v1/updateindividual", validateContentType, (req, res, next) => {
    logger.info(
      "[UpdateIndividualRoute]:Entered Route create UpdateIndividualRoute"
    );
    this.individualService
      .updateIndividual(req.body, req)
      .then((data) => res.send(data))
      .catch((error) => next(error));
  });
};
