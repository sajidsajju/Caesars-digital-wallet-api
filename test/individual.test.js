var expect = require('chai').expect;
const { response } = require('express');
var request = require('supertest');
var app = require('../app.js');

const TEST_TENANT_1 = 'Caesars';
const TEST_INVALID_TENANT = 'InvalidCaesars';
const X_TENANT = 'x-tenant';
const INDIVIDUAL_PARTNER_SERVICE_ROOT_URL = '/api/v1/individual/partner/association';
const INDIVIDUAL_BY_UID_URL = '/api/v1/individual/';
const INDIVIDUAL_IDENTIFICATION_INSTRUMENTS_BY_UID_URL = '/api/v1/individual/identificationinstruments/'
const INDIVIDUAL_BY_IDENTIFICATION_INSTRUMENT_URL = '/api/v1/individual/retrieve/identificationinstrument'
const INDIVIDUAL_BY_CONTACT_METHOD_URL = '/api/v1/individual/retrieve/contactmethod'
const UPDATE_INDIVIDUAL_UID_URL = '/api/v1/updateindividual';

describe("### Test cases for the Individual MicroService ###", function () {

    describe("@@@ Test Create individual API @@@", function () {
        it('has a route handler listening to /api/v1/individual/ for post requests', async () => {
            let individualObj = getIndividualObject();
            let response = await callServiceToCreateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).not.eql(604)
            expect(resBody.success).not.eql(false)
            expect(resBody.statusReason).not.eql('Not Found')
        });

        it("It should create individual, with all valid fields", async () => {
            let individualObj = getIndividualObject();
            let response = await callServiceToCreateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(200)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('OK')

        });

        it("It should create individual, when two contact methods(mailing and emailAddress contact method) are provided", async () => {
            let individualObj = getIndividualObject();
            delete individualObj.customer.phoneNumbers;
            let response = await callServiceToCreateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(200)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('OK')

        });

        it("It should create individual, when two contact methods(mailing and phone contact method) are provided", async () => {
            let individualObj = getIndividualObject();
            delete individualObj.customer.emailAddress;
            let response = await callServiceToCreateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(200)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('OK')

        });

        it("It should create individual, when two contact methods(emailAddress and phone contact method) are provided", async () => {
            let individualObj = getIndividualObject();
            delete individualObj.customer.mailingAddress;
            let response = await callServiceToCreateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(200)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('OK')

        });

        it("It should create individual, when atleast one contact method(mailing contact method) is provided", async () => {
            let individualObj = getIndividualObject();
            delete individualObj.customer.phoneNumbers;
            delete individualObj.customer.emailAddress;
            let response = await callServiceToCreateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(200)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('OK')

        });

        it("It should create individual, when atleast one contact method(phone contact method) is provided", async () => {
            let individualObj = getIndividualObject();
            delete individualObj.customer.mailingAddress;
            delete individualObj.customer.emailAddress;
            let response = await callServiceToCreateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(200)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('OK')

        });

        it("It should create individual, when atleast one contact method(emailAddress contact method) is provided", async () => {
            let individualObj = getIndividualObject();
            delete individualObj.customer.phoneNumbers;
            delete individualObj.customer.mailingAddress;
            let response = await callServiceToCreateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(200)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('OK')

        });

        it("It should fail, when firstName is not provided", async () => {
            let individualObj = getIndividualObject();
            delete individualObj.customer.firstName;
            let response = await callServiceToCreateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(600)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('Bad Request')
            expect(resBody.messages[0].key).eql('\"customer.firstName\" is required')
        });

        it("It should fail, when lastName is not provided", async () => {
            let individualObj = getIndividualObject();
            delete individualObj.customer.lastName;
            let response = await callServiceToCreateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(600)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('Bad Request')
            expect(resBody.messages[0].key).eql('\"customer.lastName\" is required')
        });


        it("It should fail, when Contact Method is not provided", async () => {
            let individualObj = getIndividualObject();
            delete individualObj.customer.mailingAddress;
            delete individualObj.customer.emailAddress;
            delete individualObj.customer.phoneNumbers;
            let response = await callServiceToCreateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(600)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('Bad Request')
            expect(resBody.messages[0].key).eql('At least one Contact Method is required.')
        });

        it("It should fail, when firstName is either empty or with whitespaces", async () => {
            let individualObj = getIndividualObject();
            individualObj.customer.firstName = "   ";
            let response = await callServiceToCreateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(600)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('Bad Request')
            expect(resBody.messages[0].key).eql('\"customer.firstName\" is not allowed to be empty')
        });

        it("It should fail, when lastName value is either empty or with whitespaces", async () => {
            let individualObj = getIndividualObject();
            individualObj.customer.lastName = "   ";
            let response = await callServiceToCreateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(600)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('Bad Request')
            expect(resBody.messages[0].key).eql('\"customer.lastName\" is not allowed to be empty')
        });

        it("It should fail, when dateOfBirth value is either empty or with whitespaces", async () => {
            let individualObj = getIndividualObject();
            individualObj.customer.dateOfBirth = "   ";
            let response = await callServiceToCreateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(600)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('Bad Request')
            expect(resBody.messages[0].key).eql('\"customer.dateOfBirth\" must be a valid date')
        });

        it("It should fail, when dateOfBirth is less then 18 years provided", async () => {
            let individualObj = getIndividualObject();
            individualObj.customer.dateOfBirth = "2020-02-2";
            let response = await callServiceToCreateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(600)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('Bad Request')
            expect(resBody.messages[0].key).eql('\"customer.dateOfBirth\" should be more than 18 years')
        });

        it("It should fail, when invalid email is provided to StrikeIron API", async () => {
            let individualObj = getIndividualObject();
            individualObj.customer.emailAddress.address = "fname@ac.com"
            let errResponse = await callServiceToCreateIndividual(individualObj, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errResponse.status).eql(errBody.statusCode)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('StrikeIron Error Response')
        });


        it("It should fail, if X-TENANT header value is invalid", async () => {
            let individualObj = await getIndividualObject();
            let errResponse = await callServiceToCreateIndividual(individualObj, TEST_INVALID_TENANT)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusCode).eql(errResponse.status)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('common.tenant.isnotcorrect')
        });
    });
    describe("@@@ Test Create Association of individual and Partner API @@@", function () {
        it("It should create individual partner association", async () => {
            let individualPartner = await getIndividualPartnerAssociationObject();
            let createResponse = await callServiceToCreateIndividualPartnerAssociation(individualPartner, TEST_TENANT_1)
            let createResBody = createResponse.body;
            expect(createResBody.statusCode).eql(200)
            expect(createResBody.statusCode).eql(createResponse.status)
            expect(createResBody.statusReason).eql('OK')
            // expect(createResBody.customerId).not.null             
        });

        it("It should fail, when uid is empty", async () => {
            let individualPartner = await getIndividualPartnerAssociationObject();
            individualPartner.individualPartnerAssociation["uid"] = "";
            let errResponse = await callServiceToCreateIndividualPartnerAssociation(individualPartner, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"individualPartnerAssociation.uid\" is not allowed to be empty')
        });

        it("It should fail, when partnerid is empty", async () => {
            let individualPartner = await getIndividualPartnerAssociationObject();
            individualPartner.individualPartnerAssociation["partnerId"] = "";
            let errResponse = await callServiceToCreateIndividualPartnerAssociation(individualPartner, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"individualPartnerAssociation.partnerId\" is not allowed to be empty')
        });

        it("It should fail, when verified.type field is empty", async () => {
            let individualPartner = await getIndividualPartnerAssociationObject();
            individualPartner.individualPartnerAssociation.verified["type"] = "";
            let errResponse = await callServiceToCreateIndividualPartnerAssociation(individualPartner, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"individualPartnerAssociation.verified.type\" is not allowed to be empty')
        });

        it("It should fail, when createdBy is empty", async () => {
            let individualPartner = await getIndividualPartnerAssociationObject();
            individualPartner.individualPartnerAssociation["createdBy"] = "";
            let errResponse = await callServiceToCreateIndividualPartnerAssociation(individualPartner, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"individualPartnerAssociation.createdBy\" is not allowed to be empty')
        });

        it("It should fail, when uid is not provided", async () => {
            let individualPartner = await getIndividualPartnerAssociationObject();
            individualPartner.individualPartnerAssociation["uid"] = undefined;
            let errResponse = await callServiceToCreateIndividualPartnerAssociation(individualPartner, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"individualPartnerAssociation.uid\" is required')
        });

        it("It should fail, when partnerId is not provided", async () => {
            let individualPartner = await getIndividualPartnerAssociationObject();
            individualPartner.individualPartnerAssociation["partnerId"] = undefined;
            let errResponse = await callServiceToCreateIndividualPartnerAssociation(individualPartner, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"individualPartnerAssociation.partnerId\" is required')
        });

        it("It should fail, when verified is not provided", async () => {
            let individualPartner = await getIndividualPartnerAssociationObject();
            individualPartner.individualPartnerAssociation["verified"] = undefined;
            let errResponse = await callServiceToCreateIndividualPartnerAssociation(individualPartner, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"individualPartnerAssociation.verified\" is required')
        });

        it("It should fail, when verified.type is not provided", async () => {
            let individualPartner = await getIndividualPartnerAssociationObject();
            individualPartner.individualPartnerAssociation.verified["type"] = undefined;
            let errResponse = await callServiceToCreateIndividualPartnerAssociation(individualPartner, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"individualPartnerAssociation.verified.type\" is required')
        });

        it("It should fail, when createdBy is not provided", async () => {
            let individualPartner = await getIndividualPartnerAssociationObject();
            individualPartner.individualPartnerAssociation["createdBy"] = undefined;
            let errResponse = await callServiceToCreateIndividualPartnerAssociation(individualPartner, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"individualPartnerAssociation.createdBy\" is required')
        });

        it("It should fail, if uid is not exist", async () => {
            let individualPartner = await getIndividualPartnerAssociationObject();
            individualPartner.individualPartnerAssociation["uid"] = "123";
            let errResponse = await callServiceToCreateIndividualPartnerAssociation(individualPartner, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('ID does not exist.')
        });

        it("It should fail, when we give whitespaces", async () => {
            let whitespace = await getIndividualPartnerAssociationObject_whitespaces();
            let errResponse = await callServiceToCreateIndividualPartnerAssociation(whitespace, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusCode).eql(errResponse.status)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"individualPartnerAssociation.uid\" is not allowed to be empty')
            expect(errBody.messages[1].key).eql('\"individualPartnerAssociation.partnerId\" is not allowed to be empty')
            expect(errBody.messages[2].key).eql('\"individualPartnerAssociation.verified.type\" is not allowed to be empty')
            expect(errBody.messages[3].key).eql('\"individualPartnerAssociation.createdBy\" is not allowed to be empty')
        });

        it("It should fail, if X-TENANT is invalid", async () => {
            let individualPartner = await getIndividualPartnerAssociationObject();
            let errResponse = await callServiceToCreateIndividualPartnerAssociation(individualPartner, TEST_INVALID_TENANT)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusCode).eql(errResponse.status)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('common.tenant.isnotcorrect')
        });

    });

    describe("@@@ Test Find individual by UID API @@@", function () {
        it("It should get the individual by providing valid UID", async () => {
            let uid = "628f3e30-e256-4b90-bc35-ec764cdc0957"
            let createResponse = await callServiceToGetIndividualByUID(uid, TEST_TENANT_1)
            let createResBody = createResponse.body;
            expect(createResBody.statusCode).eql(200)
            expect(createResBody.statusReason).eql('OK')
        });

        it("It should failed, when providing invalid UID", async () => {
            let uid = "invalidUID"
            let createResponse = await callServiceToGetIndividualByUID(uid, TEST_TENANT_1)
            let createResBody = createResponse.body;
            expect(createResBody.statusCode).eql(605)
        });

    });

    describe("@@@ Test Find individual identification instruments by UID API @@@", function () {
        it("It should get the individual identification instruments by providing valid UID", async () => {
            let uid = "eddad017-3f0e-4d99-bda1-e4f1112ab2f"
            let createResponse = await callServiceToGetIndividualIdentificationInstrumentsByUID(uid, TEST_TENANT_1)
            let createResBody = createResponse.body;
            expect(createResBody.statusCode).eql(200)
            expect(createResBody.statusReason).eql('OK')
        });

        it("It should failed, when providing invalid UID", async () => {
            let uid = "invalidUID"
            let errResponse = await callServiceToGetIndividualIdentificationInstrumentsByUID(uid, TEST_TENANT_1)
            let errResBody = errResponse.body;
            expect(errResBody.statusCode).eql(600)
            expect(errResBody.statusReason).eql('Bad Request')
            expect(errResBody.messages[0].key).eql('UID does not exist.')
        });

        it("It should failed, when for valid uid, identification instrument doesn't exist", async () => {
            let uid = "test-3f0e-4d99-bda1-e4f1112ab2f"
            let errResponse = await callServiceToGetIndividualIdentificationInstrumentsByUID(uid, TEST_TENANT_1)
            let errResBody = errResponse.body;
            expect(errResBody.statusCode).eql(605)
            expect(errResBody.statusReason).eql('Not Found')
        });
    });

    describe("@@@ Test Find individual by identification instruments API @@@", function () {
        it("It should get the individual by providing identification instruments", async () => {
            let identificationInstr = await getIdentificationInstrObject();
            let createResponse = await callServiceToGetIndividualByIdentificationInstrument(identificationInstr, TEST_TENANT_1)
            let createResBody = createResponse.body;
            expect(createResBody.statusCode).eql(200)
            expect(createResBody.statusReason).eql('OK')
        });

        it("It should not get the individual by providing invalid identification instruments", async () => {
            let identificationInstr = { "Number": 12 };
            let errResponse = await callServiceToGetIndividualByIdentificationInstrument(identificationInstr, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(605)
            expect(errBody.statusReason).eql('Not Found')
        });

        it("It should fail, when Number is not provided", async () => {
            let identificationInstr = await getIdentificationInstrObject();
            identificationInstr.Number = undefined;
            let errResponse = await callServiceToGetIndividualByIdentificationInstrument(identificationInstr, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"Number\" is required')
        });

        it("It should fail, when Number is null", async () => {
            let identificationInstr = await getIdentificationInstrObject();
            identificationInstr.Number = null;
            let errResponse = await callServiceToGetIndividualByIdentificationInstrument(identificationInstr, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"Number\" must be a number')
        });

        it("It should fail, when provided Number as string", async () => {
            let identificationInstr = await getIdentificationInstrObject();
            identificationInstr.Number = "Invalid Number";
            let errResponse = await callServiceToGetIndividualByIdentificationInstrument(identificationInstr, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"Number\" must be a number')
        });

        it("It should fail, when type is empty", async () => {
            let identificationInstr = await getIdentificationInstrObject();
            identificationInstr["type"] = "";
            let errResponse = await callServiceToGetIndividualByIdentificationInstrument(identificationInstr, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"type\" must be one of [DL, Green Card, Passport, State ID]')
            expect(errBody.messages[1].key).eql('\"type\" is not allowed to be empty')
        });

        it("It should fail, when issuer is empty", async () => {
            let identificationInstr = await getIdentificationInstrObject();
            identificationInstr["issuer"] = "";
            let errResponse = await callServiceToGetIndividualByIdentificationInstrument(identificationInstr, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"issuer\" is not allowed to be empty')
        });

        it("It should fail, when type is invalid", async () => {
            let identificationInstr = await getIdentificationInstrObject();
            identificationInstr["type"] = "Aadhar";
            let errResponse = await callServiceToGetIndividualByIdentificationInstrument(identificationInstr, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"type\" must be one of [DL, Green Card, Passport, State ID]')
        });

        it("It should fail, when type has whitespaces", async () => {
            let identificationInstr = await getIdentificationInstrObject();
            identificationInstr["type"] = "   ";
            let errResponse = await callServiceToGetIndividualByIdentificationInstrument(identificationInstr, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"type\" must be one of [DL, Green Card, Passport, State ID]')
            expect(errBody.messages[1].key).eql('\"type\" is not allowed to be empty')
        });

        it("It should fail, when issuer has whitespaces", async () => {
            let identificationInstr = await getIdentificationInstrObject();
            identificationInstr["issuer"] = "   ";
            let errResponse = await callServiceToGetIndividualByIdentificationInstrument(identificationInstr, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"issuer\" is not allowed to be empty')
        });

    });

    describe("@@@ Test Find individual by ContactMethod API @@@", function () {
        it("It should get the individual by providing all Contact method", async () => {
            let contactMethod = await getContactMethodObject();
            let createResponse = await callServiceToGetIndividualByContactMethod(contactMethod, TEST_TENANT_1)
            let createResBody = createResponse.body;
            expect(createResBody.statusCode).eql(200)
            expect(createResBody.statusReason).eql('OK')
        });

        it("It should get the individual by providing at least one Contact method", async () => {
            let contactMethod = await getContactMethodObject();
            delete contactMethod.emailAddress
            delete contactMethod.mailingAddress
            let createResponse = await callServiceToGetIndividualByContactMethod(contactMethod, TEST_TENANT_1)
            let createResBody = createResponse.body;
            expect(createResBody.statusCode).eql(200)
            expect(createResBody.statusReason).eql('OK')
        });

        it("It should fail when not a single Contact method is provided", async () => {
            let contactMethod = {}
            let errResponse = await callServiceToGetIndividualByContactMethod(contactMethod, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('At least one Contact Method is required.')
        });

        it("It should fail when individual does not exists with provided contact method", async () => {
            let contactMethod = await getContactMethodObject();
            contactMethod.emailAddress = {
                "type": "secondary",
                "address": "mitali.dipak-pawaskar@capgemini.com"
            }
            let errResponse = await callServiceToGetIndividualByContactMethod(contactMethod, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(605)
            expect(errBody.statusReason).eql('Not Found')
            expect(errBody.message).eql('Records not found')
        });

        it("It should fail when providing emailAddress,phoneNumbers,mailingAddress empty", async () => {
            let contactMethod = await getContactMethodObject();
            contactMethod.emailAddress = {}
            contactMethod.phoneNumbers = {}
            contactMethod.mailingAddress = {}
            let errResponse = await callServiceToGetIndividualByContactMethod(contactMethod, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"mailingAddress\" must have at least 1 key')
            expect(errBody.messages[1].key).eql('\"phoneNumbers\" must have at least 1 key')
            expect(errBody.messages[2].key).eql('\"emailAddress\" must have at least 1 key')
        });

        it("It should fail when providing emailAddress,phoneNumbers,mailingAddress empty", async () => {
            let contactMethod = await getContactMethodEmptyObject();
            let errResponse = await callServiceToGetIndividualByContactMethod(contactMethod, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"mailingAddress.streetNumber\" is not allowed to be empty')
            expect(errBody.messages[1].key).eql('\"mailingAddress.streetName\" is not allowed to be empty')
            expect(errBody.messages[2].key).eql('\"mailingAddress.city\" is not allowed to be empty')
            expect(errBody.messages[3].key).eql('\"mailingAddress.state\" is not allowed to be empty')
            expect(errBody.messages[4].key).eql('\"mailingAddress.zip\" is not allowed to be empty')
            expect(errBody.messages[5].key).eql('\"emailAddress.type\" is not allowed to be empty')
            expect(errBody.messages[6].key).eql('\"emailAddress.address\" is not allowed to be empty')
        });

        it("It should fail when instaed of string we are passing number", async () => {
            let contactMethod = await getContactMethodObject();
            contactMethod.mailingAddress = { "zip": 12345 }
            let errResponse = await callServiceToGetIndividualByContactMethod(contactMethod, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"mailingAddress.zip\" must be a string')
        });

        it("It should fail when countryCode and number are null", async () => {
            let contactMethod = await getContactMethodObject();
            contactMethod.phoneNumbers = { "countryCode": null, "number": null }
            let errResponse = await callServiceToGetIndividualByContactMethod(contactMethod, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"phoneNumbers.countryCode\" must be a number')
            expect(errBody.messages[1].key).eql('\"phoneNumbers.number\" must be a number')
        });

        it("It should fail when we provide invalid email", async () => {
            let contactMethod = await getContactMethodObject();
            contactMethod.emailAddress = { "address": "fnamecom" }
            let errResponse = await callServiceToGetIndividualByContactMethod(contactMethod, TEST_TENANT_1)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('\"emailAddress.address\" must be a valid email')
        });

        it("It should fail, if X-TENANT is invalid", async () => {
            let individualPartner = await getContactMethodObject();
            let errResponse = await callServiceToGetIndividualByContactMethod(individualPartner, TEST_INVALID_TENANT)
            let errBody = errResponse.body;
            expect(errBody.statusCode).eql(600)
            expect(errBody.statusCode).eql(errResponse.status)
            expect(errBody.statusReason).eql('Bad Request')
            expect(errBody.messages[0].key).eql('common.tenant.isnotcorrect')
        });
    });

    describe("@@@ Update individual by UID API @@@", function () {
        it("It should pass, when firstName and lastName are provided and dateOfBirth is not provided", async () => {
            let individualObj = getUpdateIndividualObject();
            delete individualObj.individual.firstName;
            delete individualObj.individual.lastName;
            let response = await callServiceToUpdateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(200)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('OK')
        });
        it("It should pass, when firstName is provided and lastName and dateOfBirth are not provided", async () => {
            let individualObj = getUpdateIndividualObject();
            delete individualObj.individual.firstName;
            let response = await callServiceToUpdateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(200)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('OK')
        });

        it("It should fail, when uid is not provided", async () => {
            let individualObj = getUpdateIndividualObject();
            delete individualObj.uid;
            let response = await callServiceToUpdateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(600)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('Bad Request')
            expect(resBody.messages[0].key).eql('\"uid\" is required')
        });
        it("It should fail, when the provided uid is not correct", async () => {
            let individualObj = getUpdateIndividualObject();
            individualObj.uid = "456";
            let response = await callServiceToUpdateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(600)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('Bad Request')
            expect(resBody.messages[0].key).eql('UID does not exist.')
        });
        it("It should fail, when firstName, lastName and dateOfBirth are not provided", async () => {
            let individualObj = getUpdateIndividualObject();
            delete individualObj.individual.firstName;
            delete individualObj.individual.lastName;
            delete individualObj.individual.dateOfBirth;
            let response = await callServiceToUpdateIndividual(individualObj, TEST_TENANT_1)
            let resBody = response.body;
            expect(response.status).eql(600)
            expect(resBody.statusCode).eql(response.status)
            expect(resBody.statusReason).eql('Bad Request')
            expect(resBody.messages[0].key).eql('At least one field need to be updated')
        });
    });

});

{
}
function getIndividualObject() {
    let individualReqObj = {
        "customer": {
            "firstName": "Mary",
            "middleName": "string",
            "lastName": "Smith",
            "preferredName": "Smith",
            "dateOfBirth": "2000-02-28",
            "phoneNumbers": [
                {
                    "label": "Phone",
                    "type": "Landline",
                    "countryCode": "91",
                    "number": "123456789",
                    "textCapable": "false",
                    "verified": "false",
                    "doNotUse": "false"
                }
            ],
            "mailingAddress": [
                {
                    "type": "Street",
                    "streetNumber": "5433",
                    "streetName": "courtside dr",
                    "city": "sfo",
                    "state": "CA",
                    "zip": "96293"
                }
            ],
            "emailAddress": {
                "type": "primary",
                "address": "mitali.dipak-pawaskar@capgemini.com"
            },
            "createdBy": "createuser"
        }
    }
    return individualReqObj
}

async function getIndividualPartnerAssociationObject() {
    var individualPartnerAssociation = {
        individualPartnerAssociation: {
            uid: "628f3e30-e256-4b90-bc35-ec764cdc0957",
            partnerId: "4321",
            verified: {
                type: "unverified"
            },
            createdBy: "System"

        }
    }
    return individualPartnerAssociation
}

async function getIndividualPartnerAssociationObject_whitespaces() {
    var individualPartnerAssociation = {
        individualPartnerAssociation: {
            uid: "  ",
            partnerId: "  ",
            verified: {
                type: "  "
            },
            createdBy: "  "

        }
    }
    return individualPartnerAssociation
}

async function getIdentificationInstrObject() {
    var identificationInstrument = {
        "Number": 123456,
        "type": "Green Card",
        "issuer": "State of CA"
    }
    return identificationInstrument
}

async function getContactMethodObject() {
    var contactMethod = {
        "emailAddress": {
            "type": "primary",
            "address": "mitali.dipak-pawaskar@capgemini.com"
        },
        "phoneNumbers": {
            "countryCode": 91,
            "number": 123456789
        },
        "mailingAddress": {
            "streetNumber": "5433",
            "streetName": "courtside dr",
            "city": "sfo",
            "state": "CA",
            "zip": "96293"
        }
    }
    return contactMethod
}

async function getContactMethodEmptyObject() {
    var contactMethod = {
        "emailAddress": {
            "type": "",
            "address": ""
        },
        "mailingAddress": {
            "streetNumber": "",
            "streetName": "",
            "city": "",
            "state": "",
            "zip": ""
        }
    }
    return contactMethod
}

function getUpdateIndividualObject() {
    let updateindividualReqObj = {
        "uid": "c4234a96-6e6c-431e-9a18-0c23ca7c1b12",
        "individual": {
            "firstName": "Mary",
            "lastName": "Smith",
            "dateOfBirth": "2000-02-28",
        }
    }
    return updateindividualReqObj
}

async function callServiceToCreateIndividual(individual, tenant) {
    return await request(app)
        .post(INDIVIDUAL_BY_UID_URL)
        .send(individual)
        .set(X_TENANT, tenant)
        .then((res) => {
            return res
        }).catch((err) => {
            console.log(err)
        });
}

async function callServiceToCreateIndividualPartnerAssociation(individualPartner, tenant) {
    return await request(app)
        .post(INDIVIDUAL_PARTNER_SERVICE_ROOT_URL)
        .send(individualPartner)
        .set(X_TENANT, tenant)
        .then((res) => {
            return res
        }).catch((err) => {
            console.log(err)
        });
}

async function callServiceToGetIndividualByUID(uid, tenant) {
    return await request(app)
        .get(INDIVIDUAL_BY_UID_URL + uid)
        .set(X_TENANT, tenant)
        .then((res) => {
            return res
        }).catch((err) => {
            console.log(err)
        });
}

async function callServiceToGetIndividualIdentificationInstrumentsByUID(uid, tenant) {
    return await request(app)
        .get(INDIVIDUAL_IDENTIFICATION_INSTRUMENTS_BY_UID_URL + uid)
        .set(X_TENANT, tenant)
        .then((res) => {
            return res
        }).catch((err) => {
            console.log(err)
        });
}

async function callServiceToGetIndividualByIdentificationInstrument(identificationInstr, tenant) {
    return await request(app)
        .post(INDIVIDUAL_BY_IDENTIFICATION_INSTRUMENT_URL)
        .send(identificationInstr)
        .set(X_TENANT, tenant)
        .then((res) => {
            return res
        }).catch((err) => {
            console.log(err)
        });
}

async function callServiceToGetIndividualByContactMethod(contactMethod, tenant) {
    return await request(app)
        .post(INDIVIDUAL_BY_CONTACT_METHOD_URL)
        .send(contactMethod)
        .set(X_TENANT, tenant)
        .then((res) => {
            return res
        }).catch((err) => {
            console.log(err)
        });
}

async function callServiceToUpdateIndividual(individual, tenant) {
    return await request(app)
        .post(UPDATE_INDIVIDUAL_UID_URL)
        .send(individual)
        .set(X_TENANT, tenant)
        .then((res) => {
            return res
        }).catch((err) => {
            console.log(err)
        });
}


