const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'), require('joi-currency-code'))
const constants = require('commonconstants')

const TIME_REGEX = /^(0[0-9]|1[0-9]|2[0-4]):[0-5][0-9]:[0-6][0-9]$/

const FieldValidator = {
    key: Joi.string().required(),
    name: Joi.string().required(),
    type: Joi.string().valid(
        constants.CUSTOM_FIELD_TYPE_BOOLEAN,
        constants.CUSTOM_FIELD_TYPE_STRING,
        constants.CUSTOM_FIELD_TYPE_INTEGER,
        constants.CUSTOM_FIELD_TYPE_DECIMAL,
        constants.CUSTOM_FIELD_TYPE_DATE,
        constants.CUSTOM_FIELD_TYPE_TIME,
        constants.CUSTOM_FIELD_TYPE_DATETIME,
        constants.CUSTOM_FIELD_TYPE_DOCUMENT),
    list: Joi.boolean()
        .when(constants.SCHEMA_TYPE, {
            is: constants.CUSTOM_FIELD_TYPE_BOOLEAN,
            then: Joi.forbidden()
        })
        .when(constants.SCHEMA_TYPE, {
            is: constants.CUSTOM_FIELD_TYPE_DOCUMENT,
            then: Joi.forbidden()
        }),
    indexed: Joi.boolean(),
    required: Joi.boolean(),
    options: Joi.array().items()
        .when(constants.SCHEMA_TYPE, {
            is: constants.CUSTOM_FIELD_TYPE_BOOLEAN,
            then: Joi.array().forbidden()
        })
        .when(constants.SCHEMA_TYPE, {
            is: constants.CUSTOM_FIELD_TYPE_STRING,
            then: Joi.array().items(Joi.string())
        })
        .when(constants.SCHEMA_TYPE, {
            is: constants.CUSTOM_FIELD_TYPE_INTEGER,
            then: Joi.array().items(Joi.number())
        })
        .when(constants.SCHEMA_TYPE, {
            is: constants.CUSTOM_FIELD_TYPE_DECIMAL,
            then: Joi.array().items(Joi.number())
        })
        .when(constants.SCHEMA_TYPE, {
            is: constants.CUSTOM_FIELD_TYPE_DATE,
            then: Joi.array().items(Joi.date().iso().format(constants.DATE_FORMAT))
        })
        .when(constants.SCHEMA_TYPE, {
            is: constants.CUSTOM_FIELD_TYPE_TIME,
            then: Joi.array().items(Joi.string().regex(TIME_REGEX))
        })
        .when(constants.SCHEMA_TYPE, {
            is: constants.CUSTOM_FIELD_TYPE_DATETIME,
            then: Joi.array().items(Joi.date().iso())
        })
        .when(constants.SCHEMA_TYPE, {
            is: constants.CUSTOM_FIELD_TYPE_DOCUMENT,
            then: Joi.array().forbidden()
        })
}

const PriceValidator = Joi.object({
    value: Joi.number().required(),
    currency: Joi.string().currency().required(),
    action: Joi.string().valid(
        constants.ACTION_PRICE_FOL,
        constants.ACTION_PRICE_FLAT,
        constants.ACTION_PRICE_POAC,
        constants.ACTION_PRICE_POD,
        constants.ACTION_PRICE_POL,
        constants.ACTION_PRICE_POM,
        constants.ACTION_PRICE_PFLAT,
        constants.ACTION_PRICE_WFLAT).required()
})

module.exports = { FieldValidator, PriceValidator }