const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'))
const constants = require('commonconstants')
const date18YearsAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 18)
const allowedIdentificationInstrumentsType = ['DL', 'Green Card', 'Passport', 'State ID']
const allowedTypeOptions = ['Mobile', 'Landline']
const allowedContactMethods = ['mailingAddress', 'phoneNumbers', 'emailAddress']
const ERR_MSG_AT_LEAST_ONE_CONTACT_METHOD = 'At least one Contact Method is required.'
const ERR_MSG_AT_LEAST_ONE_FIELD = 'At least one field need to be updated'

const emailAddressValidatorBaseModel = {
    type: Joi.string().trim().required(),
    address: Joi.string().email().trim().required()
}

const mailingAddressValidatorBaseModel = {
    type: Joi.string().trim().required(),
    streetNumber: Joi.string().trim().required(),
    streetName: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    state: Joi.string().trim().required(),
    zip: Joi.string().trim().required()
}

const phoneNumberValidatorBaseModel = {
    label: Joi.string().empty(['', null]).default("Phone").trim(),
    type: Joi.string().trim().valid(...allowedTypeOptions),
    countryCode: Joi.number().integer().max(999).messages({
        'number.max': `"phoneNumber.countryCode" must be less than or equal 3 digits`
    }).required(),
    number: Joi.number().integer().max(999999999999).messages({
        'number.max': `"number.countryCode" must be less than or equal to 12 digits`
    }).required(),
    textCapable: Joi.boolean(),
    verified: Joi.boolean().empty(['', null]).default(false),
    doNotUse: Joi.boolean().empty(['', null]).default(false)
}

let mailingAddressValidator = function () {
    let mailingAddressValidatorModel = { ...mailingAddressValidatorBaseModel };
    return mailingAddressValidatorModel
}

let emailAddressValidator = function () {
    let emailAddressValidatorModel = { ...emailAddressValidatorBaseModel };
    return emailAddressValidatorModel
}

let createPhoneNumberValidator = function () {
    let createPhoneNumberValidatorModel = { ...phoneNumberValidatorBaseModel };
    return createPhoneNumberValidatorModel
}

const customerValidatorBaseModel = {
    firstName: Joi.string()
        .min(1)
        .trim()
        .required(),
    middleName: Joi.string()
        .min(1),
    lastName: Joi.string()
        .min(1)
        .trim()
        .required(),
    preferredName: Joi.string()
        .min(1),
    dateOfBirth: Joi.date()
        .less('now')
        .max(date18YearsAgo)
        .messages({
            'date.max': `"customer.dateOfBirth" should be more than 18 years`
        }),
    mailingAddress: Joi.array().items(mailingAddressValidator()),
    phoneNumbers: Joi.array().items(createPhoneNumberValidator()),
    emailAddress: Joi.object(emailAddressValidator())
}

const individualValidatorBaseModel = {
    firstName: Joi.string().regex(/^[a-zA-Z]+$/).messages({
        'string.pattern.base': `"firstName should not contain any special characters or numbers"`
    }).min(1).trim().allow(null).allow(''),
    lastName: Joi.string().regex(/^[a-zA-Z]+$/).messages({
        'string.pattern.base': `"lastName should not contain any special characters or numbers"`
    }).min(1).trim().allow(null).allow(''),
    dateOfBirth: Joi.date().min(1)
        .format("YYYY-MM-DD")
        .less("now")
        .max(date18YearsAgo)
        .messages({
            "date.max": `"individual.dateOfBirth" should be more than 18 years`,
        })
        .raw().allow(null).allow('')

};

let createCustomerValidator = function () {
    let createCustomerValidatorModel = { ...customerValidatorBaseModel }
    createCustomerValidatorModel.createdBy = Joi.string().required()
    return createCustomerValidatorModel
}

const CreateCustomerRequestValidator =
    Joi.object({
        customer: Joi.object(createCustomerValidator())
            .or(...allowedContactMethods)
            .messages({ 'object.missing': ERR_MSG_AT_LEAST_ONE_CONTACT_METHOD })
            .required()
    })

const individualAssociationValidatorBaseModel = {
    uid: Joi.string()
        .trim()
        .min(1)
        .required(),
    partnerId: Joi.string()
        .min(1)
        .trim()
        .required(),

    verified: Joi.object({
        type: Joi.string().trim().required()
    }).required()
}

let createIndividualAssociationValidator = function () {
    let createIndividualAssociationValidatorModel = { ...individualAssociationValidatorBaseModel }
    createIndividualAssociationValidatorModel.createdBy = Joi.string().trim().required()
    return createIndividualAssociationValidatorModel
}

let individualCustomerValidator = function () {
    let individualCustomerValidatorModel = { ...individualValidatorBaseModel }
    return individualCustomerValidatorModel
}

const CreateIndividualAssociationRequestValidator =
    Joi.object({
        individualPartnerAssociation: Joi.object(createIndividualAssociationValidator()).required()
    })

const IdentificationInstrumentValidatorBaseModel = {
    type: Joi.string()
        .trim()
        .valid(...allowedIdentificationInstrumentsType),
    Number: Joi.number().required(),
    issuer: Joi.string().trim()

}
const IdentificationInstrumentRequestValidator = Joi.object({ ...IdentificationInstrumentValidatorBaseModel }).required()

const retrieveEmailAddressValidator = {
    type: Joi.string().trim(),
    address: Joi.string().email().trim()
}

const retrieveMailingAddressValidator = {
    streetNumber: Joi.string().trim(),
    streetName: Joi.string().trim(),
    city: Joi.string().trim(),
    state: Joi.string().trim(),
    zip: Joi.string().trim()
}

const retrievePhoneNumberValidator = {
    countryCode: Joi.number().integer().max(999).messages({
        'number.max': `"phoneNumber.countryCode" must be less than or equal 3 digits`
    }),
    number: Joi.number().integer().max(999999999999).messages({
        'number.max': `"number.countryCode" must be less than or equal to 12 digits`
    }),
}


const ContactMethodBaseModel = {
    mailingAddress: Joi.object({ ...retrieveMailingAddressValidator }).min(1),
    phoneNumbers: Joi.object({ ...retrievePhoneNumberValidator }).min(1),
    emailAddress: Joi.object({ ...retrieveEmailAddressValidator }).min(1)
}

const ContactMethodRequestValidator = Joi.object({ ...ContactMethodBaseModel })
    .or(...allowedContactMethods)
    .messages({ 'object.missing': ERR_MSG_AT_LEAST_ONE_CONTACT_METHOD })
    .required()
    const UpdateIndividualRequestValidator =
    Joi.object({
        uid: Joi.string()
            .min(1)
            .trim()
            .required(),
        individual: Joi.object(individualCustomerValidator()).messages({ 'object.min': ERR_MSG_AT_LEAST_ONE_FIELD }).min(1)
            .required()
    })

module.exports = { CreateCustomerRequestValidator, CreateIndividualAssociationRequestValidator, IdentificationInstrumentRequestValidator, ContactMethodRequestValidator, UpdateIndividualRequestValidator }