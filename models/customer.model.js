const { Entity, mergeFields, createSchemaAndDocumentModel, createSchema } = require('dcp-model')

const CUSTOMER_COLLECTION_NAME = 'customers'

const MailingAddress = createSchema({
    street: String,
    city: String,
    state: String,
    zip: String
})

const PhoneNumber = createSchema({
    type: String,
    number: String
})

const Email = createSchema({
    type: String,
    address: String
})

const Customer = mergeFields(Entity, {
    firstName: String,
    middleName: String,
    lastName: String,    
    preferredName: String,
    dateOfBirth: String,
    mailingAddress: MailingAddress,
    phoneNumbers: [PhoneNumber],
    email: [Email]
})



const schemaIndexes = [{
    fields: {
        firstName: 1,
        tenant: 1
    },
    isUnique: true
}]

const CustomerSchemaAndDocumentModel = createSchemaAndDocumentModel(CUSTOMER_COLLECTION_NAME, Customer, schemaIndexes)

module.exports = CustomerSchemaAndDocumentModel.document