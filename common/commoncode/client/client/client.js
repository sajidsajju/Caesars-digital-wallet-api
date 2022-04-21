const axios = require('axios')
const constants = require('commonconstants')
const logger = require('dcp-logger')
const { SystemException } = require('dcp-errors')

class AbstractRestCall {

    constructor(endpointUrl, operationPath) {
        if (typeof(endpointUrl) === 'undefined' || typeof(operationPath) === 'undefined') {
            throw new SystemException('Endpoint URL and Operation Path are both mandatory')
        }
        this.endpointUrl = endpointUrl
        if (this.endpointUrl.charAt(this.endpointUrl.length - 1) != '/') {
            this.endpointUrl += '/'
        }
        this.operationPath = operationPath
        this.baseUrl = this.endpointUrl + this.operationPath
    }

    setPathVariable(name, value) {
        if (!this.pathVariables) {
            this.pathVariables = {}
        }
        this.pathVariables[name] = value
    }

    setParameterValue(name, value) {
        if (!this.parameters) {
            this.parameters = {}
        }
        let parameterName = name
        let parameterValue
        if (Array.isArray(value)) {
            parameterValue = ''
            for (let i = 0; i < value.length; i++) {
                if (parameterValue.length > 0) {
                    parameterValue += ','
                }
                parameterValue += value[i]
            }
        } else {
            parameterValue = value
        }
        this.parameters[parameterName] = parameterValue
    }

    reset() {
        pathVariables = undefined
        parameters = undefined
    }

    getServiceUrl() {
        let serviceUrl = this.baseUrl
        if (this.pathVariables) {
            const pathVariables = this.pathVariables // so that this is accesible from within the function block
            Object.keys(pathVariables).forEach(function(currentPathVariableName, index) {
                serviceUrl = serviceUrl.replace('{' + currentPathVariableName + '}', pathVariables[currentPathVariableName])
            })
        }
        if (this.parameters) {
            const parameters = this.parameters // so that this is accesible from within the function block
            let isFirstParameter = true
            Object.keys(parameters).forEach(function(currentParameterName, index) {
                let separatorChar
                if (isFirstParameter) {
                    separatorChar = '?'
                    isFirstParameter = false
                } else {
                    separatorChar = '&'
                }
                serviceUrl += separatorChar + currentParameterName + '=' + parameters[currentParameterName]
            })
        }
        return serviceUrl
    }

}

class RestCallGet extends AbstractRestCall {

    constructor(endpointUrl, operationPath) {
        super(endpointUrl, operationPath)
    }

    execute() {
        return new Promise((resolve, reject) => {
            const requestUrl = this.getServiceUrl()
            axios.get(requestUrl)
                .then(function(response) {
                    resolve(response.data)
                }).catch(function(error) {
                    handleError(requestUrl, error, resolve, reject)
                })
        })
    }

}

class RestCallPost extends AbstractRestCall {

    constructor(endpointUrl, operationPath) {
        super(endpointUrl, operationPath)
    }

    execute(request) {
        return new Promise((resolve, reject) => {
            const requestUrl = this.getServiceUrl()
            axios.post(requestUrl, request)
                .then(function(response) {
                    resolve(response.data)
                }).catch(function(error) {
                    handleError(requestUrl, error, resolve, reject)
                })
        })
    }

}

class RestCallPut extends AbstractRestCall {

    constructor(endpointUrl, operationPath) {
        super(endpointUrl, operationPath)
    }

    execute(request) {
        return new Promise((resolve, reject) => {
            const requestUrl = this.getServiceUrl()
            axios.put(requestUrl, request)
                .then(function(response) {
                    resolve(response.data)
                }).catch(function(error) {
                    handleError(requestUrl, error, resolve, reject)
                })
        })
    }

}

class RestCallDelete extends AbstractRestCall {

    constructor(endpointUrl, operationPath) {
        super(endpointUrl, operationPath)
    }

    execute() {
        return new Promise((resolve, reject) => {
            const requestUrl = this.getServiceUrl()
            axios.delete(requestUrl)
                .then(function(response) {
                    resolve(response.data)
                }).catch(function(error) {
                    handleError(requestUrl, error, resolve, reject)
                })
        })
    }

}

function handleError(requestUrl, error, resolve, reject) {
    if (typeof(error.response) != 'undefined' && typeof(error.response.data.success) != 'undefined') {
        if (error.response.data.success) {
            resolve(error.response.data)
        } else {
            // Assuming that if the service is being invoked the caller has already ensured that application exception won't occur
            // we do however need to log this so that during development developer can see the application error
            logger.error(`Error calling service: ${requestUrl}`, error.response.data)
            reject(new SystemException(error.response.data.messages, error))
        }
    } else {
        reject(new SystemException(constants.ERROR_SERVICE_CALL_UNEXPECTED, error))
    }
}

module.exports = { RestCallGet, RestCallPost, RestCallPut, RestCallDelete }