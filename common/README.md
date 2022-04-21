# Common Framework
## Overview
The common framework contains all the common libraries that can be integrated and used across various services.

## Table of Contents

* [Logger](#logger)
* [Responses](#responses)
* [Error Handling](#Error-Handling)
* [Validator](#validator)
* [Constants](#constants)
* [Client](#client)
* [Config](#config)
* [Model](#model)
* [Express](#express)
* [Messaging](#messaging)
* [Kafka](#kafka)
* [Lambda](#lambda)
* [Devops](#devops)
* [Test](#test)

----

## Logger  

**Description**: A Logger object is used to log messages for a specific system or application component. The winston library is used to enable logging in the project.

**Winston : https://www.npmjs.com/package/winston**

There are six logging levels namely **info**, **error**, **debug**, **emerg**, **alert**, **crit**, **warning** and **notice**.

### Steps to configure Logger module in your project:

1. Add Logging configuration

To enable logging and change logging level from info to other levels in project we need to configure it in a application.yml file.

```
logging:
  enabled: true
  level: info
  pattern: 
    level: "[%X{correlationId}] %5p"

```


2. Import logger module
````
const logger = require('dcp-logger')

`````

3. Use logger for level **info** and **error**
````
  logger.info('message')
  logger.error('error message')

  ````
----
## Responses

**Description**: Responses Module contains different methods which can be used for different types of responses.


The Common framework contains two methods namely **buildExceptionResponse** and **buildServiceResponse** .The buildServiceResponse is called when expected response is obtained and buildExceptionResponse is called in case of any error.

### Steps to use Responses Module in your project:

1. Import buildExceptionResponse and buildServiceResponse

 ````
 const {buildExceptionResponse,buildServiceResponse } = require('dcp-responses')

 ````

2. Call the method buildServiceResponse in case of successfull response.

 * Without object

```` 
   buildServiceResponse() 

````
* With object

```` 
    buildServiceResponse(object)

````
3. Call the method buildExceptionResponse in case of any error/ exception response.This method can be used to customize error responses.

```` 
   buildExceptionResponse(error) 

````
----
## Error Handling

**Description**: This module contains class which can be used in case of handling errors.

The Common Framework contains classes like SystemException, ApplicationException, 
 ApplicationExceptions for Exception handling.

### Steps to configure Error Handling in your project:

1. Import 

````
const { ApplicationException, SystemException } = require('dcp-errors')

````

2. Use new keyword to throw exceptions

````
throw new SystemException('System Exception Message')
throw new ApplicationException()

````

The Common Framework contains classes like ApplicationErrors for error handling.

The ApplicationErrors Class has various methods like

* isValidObject(validator, json) - This method checks if the object from validator matches the Json request object.

* isCustomFieldsValid(fieldValues, fieldsMetaData) - This method checks if the custom field object is valid or not.

* isEmptyArray(array, message) - This method checks if the array is empty or not.

* raiseExceptionIfHasErrors() - This method is used to throw the error by checking if there are any error is present.

* addErrorMessage(message) - This method pushes the error in message array.

* addErrorMessage(message, parameters) - This method pushes the error in message array.

1. Import ApplicationErrors
````
const { ApplicationErrors} = require('dcp-errors')

````
2. Create an object of Class ApplicationErrors.

e.g
````
 const appErrors = new ApplicationErrors()

````
3.Use the object to call various methods of that class. Below is a code template from project Productcategory as an example.

e.g
````
appErrors.addErrorMessage('Error Message')

````
````
appErrors.raiseExceptionIfHasErrors()

````

````
async createProductCategory(request) {
        const appErrors = new ApplicationErrors()
        appErrors.isValidObject(CreateProductCategoryRequestValidator, request)

        const fields = await this.productCategoryTypeFieldService.findAllProductCategoryTypeFields(request.category.type)
        await appErrors.isCustomFieldsValid(request.category.fields, fields.fields)
        appErrors.raiseExceptionIfHasErrors()
        return await this.productCategoryRepository.createProductCategory(request.category)
            .then(categoryId => {
                return buildServiceResponse({
                    categoryId: categoryId
                })
            })
            .catch(error => {
                return buildExceptionResponse(error)
            })
    }
````
----

 ## Validator

**Description**: For the purpose of validation  **Hapi Joi Framework** is used.

**Hapi Joi Validations - https://joi.dev/api/?v=17.4.0**

````
const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'))

````

This Common Validator module contains two methods **FieldValidator** and **PriceValidator**.

### Steps to use Validator module in your project:

1. Import 

````
const { FieldValidator } = require('dcp-validator')
const { PriceValidator } = require('dcp-validator')

````
2. Use the FieldValidator method. Below is a code template used in ProductCategory as an example.

````
const ProductCategoryProductFieldValidator = FieldValidator

let createProductCategoryProductFieldValidatorRequest = function () {
   let createProductCategoryProductFieldValidatorModel = { ...ProductCategoryProductFieldValidator }
    createProductCategoryProductFieldValidatorModel.createdBy = Joi.string().required()
    return createProductCategoryProductFieldValidatorModel
}
const CreateProductCategoryProductFieldRequestValidator =
    Joi.object({
        field: Joi.object(createProductCategoryProductFieldValidatorRequest()).required()
    })

    module.exports = {
    CreateProductCategoryProductFieldRequestValidator 
}

````
If you want to create a validator specific to your service, you can create a custom validator. Below are the steps you need to follow in order to create a custom validator for your service 
 
 1. Import the Hapi/Joi library.
 ````
 const Joi = require('@hapi/joi').extend(require('@hapi/joi-date')) 
 ````
 
 2. Use the library to create a custom validator. Below is a code template from ProductCategory as an example.
 ````
 const ProductCategoryValidator = {
    name: Joi.string().required(),
    description: Joi.string().allow(""),
    imageRef: Joi.string().allow(""),
    type: Joi.string().required(),
    parentId: Joi.string(),
    externalSystemRef: Joi.string(),
    fields: Joi.object(),
    fromDate: Joi.date().iso().format(constants.DATE_FORMAT),
    throughDate: Joi.date().iso().format(constants.DATE_FORMAT).when(constants.SCHEMA_FROM_DATE, {
        then: Joi.date().iso().format(constants.DATE_FORMAT).greater(Joi.ref(constants.SCHEMA_FROM_DATE))
    })
}
````
----
## Constants

**Description:** This Module contains various constants like service framework constants,schema constants,message constants that can be used in other projects.

### Steps to use Constants in your project:

1. Import

````
const constants = require('commonconstants')

````
2. Use the constants whenever required. Below is a code template used in ProductCategory as an example.

````
 constructor() {
        super(productCategoryTypeModel, constants.SCHEMA_CODE, constants.SCHEMA_ID)
               }

````
----
## Client

**Description:** The client module has two parts **client** and **axios**.

The client.js contains a class called **AbstractRestCall**. This class contains various methods which can be used by other projects for making REST calls.

  * setPathVariable(name, value)
  * setParameterValue(name, value)
  * reset()
  * getServiceUrl()
  
The class **AbstractRestCall** is extended by four other classes RestCallGet, RestCallPost,
RestCallPut and RestCallDelete.

The client module has client.js using which REST calls are made from one DCP service to another, in case of a REST call from DCP service to a third-party API or REST calls to another service only the axios.js should be used.

### Steps to use Client module in your project:

1. Import

````
   const { RestCallGet, RestCallPost, RestCallPut, RestCallDelete } = require('dcp-client')

````
2. Make an object of the class RestCallGet/ RestCallPost/ RestCallPut/ RestCallDelete. Below is a code template from  project Productcategory as an example.

````
const restCallProduct = new RestCallGet(PRODUCT_PATH, SERVICE_V1_PRODUCT_BY_CATEGORY_ID)

````

````
const restCallProduct = new RestCallPost(PRODUCT_PATH, SERVICE_V1_PRODUCT_ASSOCIATIONS, request)

````
````
const restCallProduct = new RestCallPut(PRODUCT_PATH, SERVICE_V1_PRODUCT_ASSOCIATION_UPDATE, request)

````
````
const restCallProduct = new RestCallDelete(PRODUCT_PATH, SERVICE_V1_PRODUCT_ASSOCIATIONS)

````

3. Use the object to call the methods of the class.

e.g
````
restCallProduct.setPathVariable(PRODUCT_CATEGORY_ID, productCategoryId)

````
e.g
````
restCallProduct.setParameterValue(ASSOCIATION_IDS, associationIds)

````


## Axios

**Description:** Axios is a Javascript library used to make HTTP requests from node. js or XMLHttpRequests from the browser and it supports the Promise API that is native to JS ES6.

It is request interceptor that sets the two headers(tenant,correlationId) whenever a REST call is made.


----
## Config

**Description:** The config module has config.js which can be used to read application.yaml file in your project.
The config.js file has a method **getProperty(path, defaultValue)** is used to get the value of a property defined in application.yml. If it doesnot find the value in application.yml then the defaultValue is used.


### Steps to use Config module in your project: 

1. Import

````
const config = require('dcp-config')

````
2. Use getProperty 

````
const PRODUCT_PATH = config.getProperty('dcp.services.product',https://productapi.digitalcloudplatform.com)

````
----
## Model

**Description:** The Model module has all the common models which can be used across various services.
It has five methods namely,
 
* mergeFields(base, child) - This method is used  to implement class hierarchy as per the schema design of the service.

* normalizeSchema(schema) - This method is to replace _id of mongoose to id and disable __v in the response.

* createSchema(model) - This method is used to create Schema.

* createSchemaAndDocumentModel(collectionName, model, schemaIndexes) - This method is used to create Schema and the document from that schema. It also creates a collection for that model. 

* referenceCheck(schema, field, message) - This method checks if the field is available in another collection.

module.js also contains various Objects defining models that can be used in different services.

* Entity
* ActivableEntity
* MultiTenantEntity
* Address
* TelephoneNumber
* PriceAction
* Price
* FieldType
* Field
* Gender

### Steps to use Model Module in your project:

1. Import the methods and models required.

```
const { ActivableEntity, Field, mergeFields, createSchema, createSchemaAndDocumentModel, referenceCheck } = require('dcp-model')

```
2. Use methods and models to create required model. Below is a code template from Productcategory as an example.

````
const FieldSchema = createSchema(Field)
const ProductCategory = mergeFields(ActivableEntity, {
    name: String,
    description: String,
    imageRef: String,
    type: {
        type: String,
        validate: referenceCheck(ProductCategoryTypeSchema, constants.SCHEMA_CODE, CATEGORY_TYPE_NOT_FOUND)
    },
    parentId: String,
    externalSystemRef: String,
    fields: Map
})

````
````
const ProductCategoryTypeSchemaAndDocumentModel = createSchemaAndDocumentModel(PRODUCT_CATEGORY_TYPES_COLLECTION, ProductCategoryTypeDocument, schemaIndexes)
````

For models specific to your service,it is advised to create a separate file containing models related to the specific service
 Below is a code template from loyaltypoint.model.js of LoyaltyPoint service which consists of a model **LoyaltyPointType** useful only for this service.
 
 ````
 const LoyaltyPointType = {
    type: String,
    enum: [
        SCHEMA_LOYALTY_POINT_TYPE_EARNED,
        SCHEMA_LOYALTY_POINT_TYPE_REWARD_REDEEMED,
        SCHEMA_LOYALTY_POINT_TYPE_REVERTED,
        SCHEMA_LOYALTY_POINT_TYPE_MANUALLY_ADJUSTED
    ]
}
 ````
----
## Express

**Description:** Express is a back end web application framework used for building web applications and APIs.
The express module is divided into three submodules namely **express**, **loader**, **routes**.

The express submodule has express.js which contains two methods namely **loadExpressJS** ,  **startExpressJS**.

  * loadExpressJS(routes, swaggerDocument)- This method loads express and als and sets the value for tenant and correlationId
  * startExpressJS(app)- This method sets the port and starts the express server on that port.

### Steps to use express submodule in your project

1. Import in app.js of your project
````
const { loadExpressJS, startExpressJS } = require('dcp-express')

````
2. Create a constant app and call the loadExpressJS method

````
const app = loadExpressJS(routes, swaggerDocument)

````
3. Call the startExpressJS method
````
await startExpressJS(app)

````
#### Note: The Common Framework allows both containerized deployments using Express framework and Serverless deployments using Lambda. For more information,see the section **Devops**.

## <a name="loader"></a>Loader

**Description:** A loader is a major component of an operating system that ensures all necessary programs and libraries are loaded, which is essential during the startup phase of running a program.

The loader submodule has loader.js which contains a method **loadFrameworks()**

### Steps to use the loader submodule in your project

1. Import in the app.js in your project

````
const loadFrameworks = require('dcp-loader'),

````
2. Use loadFrameworks(). Below is a code template from app.js of service ProductCategory as an example.

````
async function startServer() {
    await loadFrameworks()
    await startExpressJS(app)
}

````

## Routes

**Description**: This submodule contains methods that can be used to define routes in your Project. The routes submodule has two methods namely **getArrayParameter** and **getBooleanParameter**.

* getArrayParameter(arrayField)- This methods removes the comma and converts the string of elements into an array.
* getBooleanParameter(booleanField)- This method checks the string value is true or false and sets the boolean value.

### Steps to use Routes submodule in your project


1. Import

````
const { getArrayParameter, getBooleanParameter } = require('dcp-routes')

````

2. Use methods getArrayParameter,getBooleanParameter. Below is code template from project ProductCategory as an example.

````
 let retrieveInactive = getBooleanParameter(req.query.retrieveInactive)

````
````
 let productCategoryIds = getArrayParameter(req.query.productCategoryIds)
 let externalSystemRefs = getArrayParameter(req.query.externalSystemRefs)
````
----
## Messaging

**Description:** The Messaging module contains two submodules messaging and kafka. 
The messaging submodule has a messaging.js which is used to set Kafka as a messaging queue.

The Kafka Module is developed in such a way  that in future it can easily be replaced with any other messaging queue like rabbitMQ. This is done using the messaging submodule.


## Kafka

**Description:** Kafka is a distributed system consisting of servers and clients that communicate via a high-performance TCP network protocol. It can be deployed on bare-metal hardware, virtual machines, and containers in on-premise as well as cloud environments.

The Kafka.js has two methods namely
 * messageSender(channel)
 * messageReceiver(channel, handler)

### Steps to use Kafka submodule in your project:

1. Import messaging submodule

````
const messaging = require('dcp-messaging')
````
2. Use the method messageSender, Below is a code template from loyaltyProfile  as an example.

````
 const loyaltyPointEventSender = messaging.messageSender(LOYALTY_EVENT)
        const LoyaltyPointEventRequest = { loyaltyPointEvent: loyaltyPointEvent }
        loyaltyPointEventSender(LoyaltyPointEventRequest)
````
3. Use the method,  Below is a code template from loyaltyProfile  as an example.

````
async function loyaltyPointMessageHandler(payload) {
  const loyaltyProfileService = new LoyaltyProfileService()
  await loyaltyProfileService.earnLoyaltyPoints({ loyaltyPoint: payload })
}
messaging.messageReceiver(LOYALTY_POINT_EVENT, loyaltyPointMessageHandler)
````
----
## Lambda

**Description:** Lambda is a serverless compute service that runs your code in response to events and automatically manages the underlying compute resources for you.

The Lambda module has a lambda.js which contains a method **commonHandler(event, operationHandler)** which can be imported and used in your project to make calls to your service, we call it as the **operationHandler**.

* commonHandler(event, operationHandler) - 

    * This methods returns the warmup message in the case if call is from warmup plugin

    * It also loads all the required frameworks like mongoose, als, axios.

    * It validates tenant and correlationId in the request and sets them in local storage.

    * Makes a call to a method(operationHandler) which will be passed by your project's      lambda handler.

    * Generate and returns the response to your project's lambda handler

### Steps to use Lambda module in your project

1. Create a handler.js in your lambda folder.

````
lambda/createCustomerHandler.js

````
2. Import the commonhandler in your handler.js.

````
const commonHandler = require('dcp-lambda')

````

3. Use the commonHandler

````
module.exports.handle = async (event, context, callback) => {
    return await commonHandler(event, async function (event) {
        return await productCategoryService.createProductCategory(JSON.parse(event.body));
    })
}
````

#### Note: The Common Framework allows both containerized deployments using Express framework and Serverless deployments using Lambda. For more information,see the section **Devops**.

----
## Devops

### Deploy Common Code and Libraries Modules on AWS Lambda Layers

For more information about AWS Lambda Layers you can refer this link https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html

### Steps to follow for successful build and deployment

1. Install node using the link https://nodejs.org/en/download/

2. check  node version and npm version

```
node --version
npm --version

````

3. Install node_modules of Common package.json

````
npm install

````
4. Install node_modules of common/commoncode package.json
````
cd commoncode
npm install
cd ..
````
5. Install node_modules of common/commonlib package.json

````
cd commonlib
npm install
cd ..

````
4.  Install serverless Framework

````
npm install -g serverless

````

5. Check SLS version installed

````
sls --version

````
6. To deploy a project using serverless framework on AWS, the serverless.yml configuration file must be included first in your project root folder.

   For more information on serverless.yml please refer this link.
   https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml/

   This serverless.yml contains 2 layers namely **commonlib** and **commoncode**.

````
service: dcp-common-layers
plugins:
  - serverless-stage-manager
custom:
  stages:
    - dev
    - qa
    - prod

provider:
  name: aws
  runtime: nodejs12.x
  region: us-east-1
  stage: ${opt:stage,'dev'}
  iamRoleStatements:
    - Effect: Allow
      Action: 'lambda:PublishLayerVersion'
      Resource: 
        - '*'

layers:
  commonlib:
    path: commonlib
    name: ${self:provider.stage}-dcp-common-lib-layer # optional
    description: Description of what the lambda layer does # optional
    compatibleRuntimes: # optional
      - nodejs10.x
    licenseInfo: GPLv3 # optional
    allowedAccounts:
      - '*' # all accounts
    retain: false # optional
  commoncode:
    path: commoncode
    name: ${self:provider.stage}-dcp-common-code-layer # optional
    description: Description of what the lambda layer does # optional
    compatibleRuntimes: # optional
      - nodejs10.x
    licenseInfo: GPLv3 # optional
    allowedAccounts:
      - '*' # all accounts
    retain: false # optional

````
7. Deploy common folder on lambda layers

````
sls deploy --stage "$DEPLOYMENT_STAGE"

````
----
## Test

**Description:** The test module contains various classes that can be extended and used by other projects for the purpose of testing.

Each of these Classes have methods that can be used while writing tests for another service.The various classes available in test.js are :

  * AbstractEntityTests
  * AbstractActivableEntityTests
  * AbstractMultiIdsGetEntityTests
  * AbstractTypeEntityTests
  * AbstractTypeFieldEntityTests
  * AbstractFieldEntityTests

Some of the methods are:

  * getCreateTestModel(prefix, suffix, tenant)
  * getUpdateTestModel(prefix, suffix, tenant)
  * callServiceToCreateRecord(model, tenant)
  * callServiceToUpdateRecord(updateModel, recordId, tenant)
  * callServiceToGetAllRecords(tenant, retrieveInactive)
  * callServiceToDeleteRecord(createdRecordIds, tenant)
  * validateCreatedRecordData(expectedModel, actualModel)
  * validateUpdatedRecordData(expectedModel, actualModel)
  * getRecordWithIdFromList(records, recordId)
  * createReferenceDataIfRequired(tenants)
  * cleanupRecordsInDatabase(tenants)

### Steps to use test module for testing your project:

1. Import chai and supertest

````
var expect = require('chai').expect;
var request = require('supertest');

````
2. Import the class required from the test.js and make sure that your class extends them.

````
const { AbstractMultiIdsGetEntityTests } = require('dcp-test')

````

````
const { AbstractEntityTests } = require('dcp-test')

````
````
const { AbstractFieldEntityTests } = require('dcp-test')

````

````
const { AbstractTypeEntityTests } = require('dcp-test')

````
````
const { AbstractTypeFieldEntityTests } = require('dcp-test')

````

----