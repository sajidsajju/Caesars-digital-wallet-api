const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2')
const constants = require('commonconstants')
const als = require('async-local-storage')
const moment = require('moment')

/**
 * Conventions to be followed for models are as follows
 * 1. Any object that has been created using new mongoose.Schema(...) should end with the name Schema in it e.g. PriceSchema, ProductAssociationSchema
 * 2. createDocumentModel should always have the collection name parameter in lower case and with no paces e.g. productassociationtypes
 * 3. createDocumentModel must only be called on objects that desribe the documents completely within a single collection
 * 4. createSchema must be called and the object returned from it must be used as type for any object, e.g. PriceSchema must be used in the price field of Product and not Price
 * 5. Use mergeFields to implement class hierarchy as per the schema design of the service
 * 6. There is no need to merge tenant as this will happen automatically when createDocumentModel is called
 */

function mergeFields(base, child) {
    return Object.assign({}, base, child)
}

function normalizeSchema(schema) {

    schema.set('toObject', {
        versionKey: false,
        transform: function (doc, ret, options) {
            ret.id = ret._id
            if (typeof (ret.fromDate) !== 'undefined') {
                ret.fromDate = moment(ret.fromDate).format(constants.DATE_FORMAT)
            }
            if (typeof (ret.throughDate) !== 'undefined') {
                ret.throughDate = moment(ret.throughDate).format(constants.DATE_FORMAT)
            }
            delete ret._id
        }
    })

    schema.set('toJSON', {
        versionKey: false, // to disable __v
        transform: function (doc, ret, options) {
            ret.id = ret._id
            if (typeof (ret.fromDate) !== 'undefined') {
                ret.fromDate = moment(ret.fromDate).format(constants.DATE_FORMAT)
            }
            if (typeof (ret.throughDate) !== 'undefined') {
                ret.throughDate = moment(ret.throughDate).format(constants.DATE_FORMAT)
            }
            delete ret._id
        }
    })

}

function createSchema(model) {
    const schema = new mongoose.Schema(model)
    normalizeSchema(schema)
    return schema
}

function createSchemaAndDocumentModel(collectionName, model, schemaIndexes) {
    // All documents must be multitenant
    const multitenantModel = Object.assign({}, MultiTenantEntity, model)
    const schema = createSchema(multitenantModel)

    schema.plugin(mongoosePaginate)
    schema.plugin(mongooseAggregatePaginate)

    // automatically setup a tenant 
    let tenantIndex = {}
    tenantIndex[constants.SCHEMA_TENANT] = 1
    schema.index(tenantIndex)

    if (typeof (schemaIndexes) !== 'undefined' && schemaIndexes.length > 0) {
        for (let i = 0; i < schemaIndexes.length; i++) {
            schema.index(schemaIndexes[i].fields, { unique: schemaIndexes[i].isUnique })
        }
    }

    const document = mongoose.model(collectionName, schema)

    return {
        schema: schema,
        document: document

    }
}

const Entity = {
    id: String,
    createdBy: String,
    createdDate: Date,
    modifiedBy: String,
    modifiedDate: Date
}

const ActivableEntity = mergeFields(Entity, {
    fromDate: Date,
    throughDate: Date
})

const MultiTenantEntity = {
    tenant: String
}

const Address = {
    address1: String,
    address2: String,
    landmark: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    latitude: Number,
    longitude: Number
}

const PriceAction = {
    type: String,
    enum: [
        constants.ACTION_PRICE_FOL, // Flat Amount Modify
        constants.ACTION_PRICE_FLAT, // Flat Amount Override
        constants.ACTION_PRICE_POAC, // Percent Of Average Cost
        constants.ACTION_PRICE_POD, // Percent Of Default Price
        constants.ACTION_PRICE_POL, // Percent Of List Price
        constants.ACTION_PRICE_POM, // Percent Of Margin
        constants.ACTION_PRICE_PFLAT, // Promo Amount Override
        constants.ACTION_PRICE_WFLAT // Wholesale Amount Override
    ]
}

const Price = {
    value: Number,
    currency: String,
    action: PriceAction
}

const TelephoneNumber = {
    contactNumber: Number
}

const FieldType = {
    type: String,
    enum: [
        constants.CUSTOM_FIELD_TYPE_BOOLEAN,
        constants.CUSTOM_FIELD_TYPE_STRING,
        constants.CUSTOM_FIELD_TYPE_INTEGER,
        constants.CUSTOM_FIELD_TYPE_DECIMAL,
        constants.CUSTOM_FIELD_TYPE_DATE,
        constants.CUSTOM_FIELD_TYPE_TIME,
        constants.CUSTOM_FIELD_TYPE_DATETIME,
        constants.CUSTOM_FIELD_TYPE_DOCUMENT
    ]
}

const Field = mergeFields(Entity, {
    key: String,
    name: String,
    type: FieldType,
    required: Boolean,
    list: Boolean,
    indexed: Boolean,
    options: { type: Array, default: undefined }
})

const Gender = {
    type: String,
    enum: [constants.GENDER_MALE, constants.GENDER_FEMALE]
}

function referenceCheck(schema, field, message) {
    let validate = {
        validator: async (value) => {
            let query = {}
            query[field] = value
            query[constants.SCHEMA_TENANT] = als.get(constants.KEY_TENANT)
            return await schema.findOne(query, function (rec) {
                rec !== null
            })
        },
        message: props => `${props.value} ${message}`
    }
    return validate
}

module.exports = {
    Entity,
    ActivableEntity,
    MultiTenantEntity,
    Address,
    TelephoneNumber,
    PriceAction,
    Price,
    FieldType,
    Field,
    Gender,
    mergeFields,
    createSchema,
    createSchemaAndDocumentModel,
    referenceCheck
}