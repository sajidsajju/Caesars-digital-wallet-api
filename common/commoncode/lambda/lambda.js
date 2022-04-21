const mongooseLoader = require('dcp-mongoose');
const commonconstants = require('commonconstants');
const { ApplicationException } = require('dcp-errors');
const logger = require('dcp-logger');
const als = require('async-local-storage');
const { v4: uuidv4 } = require('uuid');
const { buildServiceResponse, buildExceptionResponse } = require('dcp-responses');
const { config } = require('dcp-config')
const axiosLoader = require('dcp-axios')
// mongooseLoader()

// const mongoose = async function() {
//     try {
//         await mongooseLoader()
//     } catch (err) {
//         let errorResponse = buildExceptionResponse(err);

//         let lambdaErrorResponse = generateLambdaResponse(errorResponse);

//         logger.info('Error in commonHandler');
//         logger.info(JSON.stringify(lambdaErrorResponse))
//         return lambdaErrorResponse;
//     }
// }

// mongoose()

const WARMUP_MSG = 'Lambda is warm!';

async function commonHandler(event, operationHandler) {
    logger.info('In commonHandler')
    try {
        if (isWarmupPing(event)) return generateLambdaResponse(buildServiceResponse(WARMUP_MSG));

        await mongooseLoader()

        await als.enable();

        als.scope();

        let correlationId = event.headers[commonconstants.KEY_CORRELATION_ID.toUpperCase()];
        if (!correlationId) {
            correlationId = uuidv4();
        }
        als.set(commonconstants.KEY_CORRELATION_ID, correlationId);


        let tenant = validateTenant(event.headers);

        logger.info(tenant)

        als.set(commonconstants.KEY_TENANT, tenant);

        await axiosLoader()
        logger.info('Axios framework configured ...')

        let serviceResponse = await operationHandler(event);

        return generateLambdaResponse(serviceResponse);
    } catch (err) {
        let errorResponse = buildExceptionResponse(err);

        let lambdaErrorResponse = generateLambdaResponse(errorResponse);

        logger.info('Error in commonHandler');
        logger.info(JSON.stringify(lambdaErrorResponse))
        return lambdaErrorResponse;
    }

};

function generateLambdaResponse(response) {
    logger.info('response')
    logger.info(JSON.stringify(response))
    let lambdaResponse = {
        statusCode: response.statusCode,
        body: JSON.stringify(response),
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
            "Access-Control-Allow-Methods": "GET,OPTIONS,POST",
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization,X-TENANT,x-tenant",
            "Content-Type": "application/json"
        }
    };
    return lambdaResponse;
};

function validateTenant(headers) {
    if (typeof (headers) !== 'undefined') {
        let tenant = headers[commonconstants.KEY_TENANT.toUpperCase()] || headers[commonconstants.KEY_TENANT]
        if (!tenant) {
            throw new ApplicationException(commonconstants.ERROR_TENANT_HEADER_NOT_PROVIDED); //Replace this with code constants
        }
        return tenant
    }
    throw new ApplicationException(commonconstants.ERROR_TENANT_HEADER_NOT_PROVIDED); //Replace this with code constants
};

function isWarmupPing(event) {
    if (event.source === 'serverless-plugin-warmup') {
        logger.info('WarmUP - Lambda is warm!')
        return true;
    } else {
        return false;
    }
}

function isAuthorize(event) {
    var flag = false;
    if (event.requestContext && event.requestContext.authorizer) {
        let userRole = event.requestContext.authorizer.customKey;
        if (process.env.Authorize.indexOf(userRole) != -1) {
            flag = true;
        }
    }
    return flag;
}
module.exports = commonHandler