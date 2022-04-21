const { buildServiceResponse, buildExceptionResponse } = require('dcp-responses');
const { ApplicationErrors, ApplicationException, RecordsNotFoundException } = require('dcp-errors');
const { CreateCustomerRequestValidator, CreateIndividualAssociationRequestValidator, IdentificationInstrumentRequestValidator, ContactMethodRequestValidator, UpdateIndividualRequestValidator } = require('../validators/individual.validator');
const { IndividualRepository } = require('../repository/individual.repository');
const logger = require('dcp-logger');
const axios = require('axios');
const uuid = require('uuid');

class IndividualService {

    constructor() {
        this.individualRepository = new IndividualRepository()
    }

    // Create a new Customer //
    async createIndividual(request) {
        try {
            logger.info('[IndividualService]: Entered createIndividual')
            const appErrors = new ApplicationErrors()
            appErrors.isValidObject(CreateCustomerRequestValidator, request)
            appErrors.raiseExceptionIfHasErrors()
            const { value: validatedRequest } = CreateCustomerRequestValidator.validate(request)
            //const individualUID = await this.individualRepository.createIndividual(validatedRequest.customer)
            const emailAddress = validatedRequest.customer.emailAddress?.address
            if (emailAddress) {
                await this.callStrikeironAPI(emailAddress)
            }
            const serviceReponse = buildServiceResponse({ uid: uuid.v4() })
            validatedRequest.correlationId = serviceReponse.correlationId
            validatedRequest.uid = serviceReponse.uid
            await this.produceKafkaMessage(validatedRequest)
            logger.info('[IndividualService]: Existing createIndividual')
            return serviceReponse
        }
        catch (err) {
            throw err
        }
    }

    // Find all Entities
    async findAllIndividuals(retrieveInactive) {
        try {
            logger.info('[IndividualService]: Entered findAllIndividuals')
            if (typeof (retrieveInactive) === 'undefined') {
                retrieveInactive = false
            }
            const individuals = await this.individualRepository.findAllIndividual(retrieveInactive)
            logger.info('[IndividualService]: Existing findAllIndividuals')
            return buildServiceResponse({ individuals })
        } catch (err) {
            throw err
        }
    }

    // Get individual by uid
    async findIndividualbyUID(uid) {
        try {
            logger.info('[IndividualService]: Entered findIndividualbyUID')
            let individual = {}
            const [individualResult] = await this.individualRepository.findIndividualbyUID(uid)
            if (individualResult && individualResult.customer_json) {
                individual = individualResult.customer_json
            } else {
                throw new RecordsNotFoundException()
            }
            logger.info('[IndividualService]: Existing findIndividualbyUID')
            return buildServiceResponse({ individual })
        } catch (err) {
            logger.error('[IndividualService]: Error in findIndividualbyUID')
            throw err;
        }
    }


    // Create a new Partner Individual Association 
    async individualPartnerAssociation(request) {
        try {
            logger.info('[IndividualService]: Entered individualPartnerAssociation')
            const appErrors = new ApplicationErrors()
            appErrors.isValidObject(CreateIndividualAssociationRequestValidator, request)
            appErrors.raiseExceptionIfHasErrors()

            const { value: validatedRequest } = CreateIndividualAssociationRequestValidator.validate(request);

            await this.findIndividualbyUID(validatedRequest.individualPartnerAssociation.uid)
            await this.individualRepository.associateIndividualPartner(validatedRequest.individualPartnerAssociation)
            logger.info('[IndividualService]: Existing individualPartnerAssociation')
            return buildServiceResponse()
        } catch (err) {
            logger.error('[IndividualService]: Error in individualPartnerAssociation')
            if (err?.name === "RecordsNotFoundException") {
                const appErrors = new ApplicationErrors()
                appErrors.addErrorMessage("ID does not exist.", request.individualPartnerAssociation.uid);
                appErrors.raiseExceptionIfHasErrors()
            }
            throw err;
        }
    }

    // Get identification instrument by uid
    async getIdentificationInstrumentsbyUID(uid) {
        try {
            logger.info('[IndividualService]: Entered getIdentificationInstrumentsbyUID')
            if (!uid.trim()) {
                const appErrors = new ApplicationErrors()
                appErrors.addErrorMessage('\"uid\" is required')
                appErrors.raiseExceptionIfHasErrors()
            }
            const [data] = await this.individualRepository.findIdentificationInstrumentsbyUID(uid)
            this.verifyUIDandIdentificationInstrExists(data)
            logger.info('[IndividualService]: Exiting getIdentificationInstrumentsbyUID')
            return buildServiceResponse({ individual_identities: data.identificationInstr })
        } catch (err) {
            logger.error('[IndividualService]: Error in getIdentificationInstrumentsbyUID')
            throw err;
        }
    }

    // Get Individual By identification instrument
    async getIndividualbyIdentificationInstrument(request) {
        try {
            logger.info('[IndividualService]: Entered getIndividualbyIdentificationInstrument')
            const appErrors = new ApplicationErrors()
            appErrors.isValidObject(IdentificationInstrumentRequestValidator, request)
            appErrors.raiseExceptionIfHasErrors()

            const { value: validatedRequest } = IdentificationInstrumentRequestValidator.validate(request)
            const [individual] = await this.individualRepository.findIndividualbyIdentificationInstrument(validatedRequest)
            if (!individual) {
                throw new RecordsNotFoundException()
            }
            logger.info('[IndividualService]: Exiting getIndividualbyIdentificationInstrument')
            return buildServiceResponse({ individual })
        } catch (err) {
            logger.error('[IndividualService]: Error in getIndividualbyIdentificationInstrument')
            throw err
        }
    }

    // Get Individual By Contact Method
    async getIndividualByContactMethod(request) {
        try {
            logger.info('[IndividualService]: Entered getIndividualByContactMethod')
            const appErrors = new ApplicationErrors()
            appErrors.isValidObject(ContactMethodRequestValidator, request)
            appErrors.raiseExceptionIfHasErrors()
            const { value: validatedRequest } = ContactMethodRequestValidator.validate(request)
            const emailAddress = validatedRequest.emailAddress?.address
            if (emailAddress) {
                await this.callStrikeironAPI(emailAddress)
            }
            let individual = await this.individualRepository.findIndividualbyContactMethod(validatedRequest)
            if (!individual.length) {
                throw new RecordsNotFoundException()
            }
            logger.info('[IndividualService]: Exiting getIndividualByContactMethod')
            return buildServiceResponse({ individual })

        } catch (err) {
            logger.error('[IndividualService]: Error in getIndividualByContactMethod')
            throw err
        }
    }

    //update individual
    async updateIndividual(request, req) {
        try {
            logger.info('[IndividualService]: Entered updateIndividual')
            const appErrors = new ApplicationErrors()
            appErrors.isValidObject(UpdateIndividualRequestValidator, request)
            appErrors.raiseExceptionIfHasErrors()
            const { value: validatedRequest } = UpdateIndividualRequestValidator.validate(request)
            await this.findIndividualbyUID(validatedRequest.uid)
            const data = await this.individualRepository.updateIndividualRepo(validatedRequest.individual, validatedRequest.uid)

            const serviceReponse = buildServiceResponse()
            validatedRequest.correlationId = serviceReponse.correlationId
            await this.produceKafkaMessage(validatedRequest)
            logger.info('[IndividualService]: Exiting updateIndividual')
            return serviceReponse
        }
        catch (err) {
            logger.error('[IndividualService]: Error updateIndividual')
            if (err?.name === "RecordsNotFoundException") {
                const appErrors = new ApplicationErrors()
                appErrors.addErrorMessage("UID does not exist.", request.uid);
                appErrors.raiseExceptionIfHasErrors()
            }

            throw err
        }
    }

    callStrikeironAPI(emailAddress) {
        const funcName = 'strikeironAPIValidation'
        logger.info(`[IndividualService]: Entered ${funcName}`)
        const options = {
            method: 'get',
            url: process.env.STRIKEIRON_URL,
            params: {
                'LicenseInfo.RegisteredUser.UserID': process.env.STRIKEIRON_USERNAME,
                'LicenseInfo.RegisteredUser.Password': process.env.STRIKEIRON_PASSWORD,
                'VerifyEmail.Email': emailAddress,
                'VerifyEmail.Timeout': '10',
                'format': 'JSON'
            },
            headers: {
                'Content-Type': 'application/json',
            }
        }
        /* strikeiron API  */
        return axios(options)
            .then((strikeIronResponse) => {
                const statusCode = strikeIronResponse.data.WebServiceResponse.VerifyEmailResponse.VerifyEmailResult.ServiceStatus.StatusNbr;
                const strikeIronError = strikeIronResponse.data.WebServiceResponse.VerifyEmailResponse.VerifyEmailResult.ServiceStatus.StatusDescription;
                if (statusCode != 200) {
                    const appErrors = new ApplicationErrors()
                    appErrors.addErrorMessage('StrikeIron Error Response', strikeIronError);
                    appErrors.raiseExceptionIfHasErrors()
                }
                logger.info(`[IndividualService]: Existing ${funcName}`)
            })
            .catch((err) => {
                logger.error(`[IndividualService]: Error in ${funcName}`)
                throw err
            })
    }

    produceKafkaMessage(request) {
        const funcName = 'produceKafkaMessage'
        logger.info(`[IndividualService]: Entered ${funcName}`)

        const data = { "records": [{ "key": "createIndividual", "value": request }] }
        const options = {
            method: 'post',
            url: process.env.KAFKA_URL,
            data,
            headers: {
                'Content-Type': 'application/vnd.kafka.json.v2+json',
            }
        }
        return axios(options)
            .then((response) => {
                if (response.status === 200) {
                    logger.info("[IndividualService]: Kafka message is produced successfully.")
                }
                logger.info(`[IndividualService]: Existing ${funcName}`)
            })
            .catch((error) => {
                logger.error(`[IndividualService]: Error in ${funcName}`)
                throw error
            })
    }

    verifyUIDandIdentificationInstrExists(data) {
        logger.info('[IndividualService]: Entered verifyUIDandIdentificationInstruments')
        if (!data) {
            const appErrors = new ApplicationErrors()
            appErrors.addErrorMessage('UID does not exist.')
            appErrors.raiseExceptionIfHasErrors()
        }
        if (!data?.identificationInstr) {
            throw new RecordsNotFoundException()
        }
        logger.info('[IndividualService]: Exiting verifyUIDandIdentificationInstruments')
    }
}

exports.IndividualService = IndividualService


