const constants = require('commonconstants')
const isoDatestringValidator = require('iso-datestring-validator')

class SystemException extends Error {

    constructor(message, error) {
        super(message, error)
        this.name = 'SystemException'
        this.message = message
        this.cause = error
        Error.captureStackTrace(this, this.constructor)
    }
}

class ApplicationException extends Error {

    constructor(key, parameters) {
        super('ApplicationException')
        this.name = 'ApplicationException'
        this.messages = [{ key: key, parameters: parameters }]
        Error.captureStackTrace(this, this.constructor)
    }

}

class RecordsNotFoundException extends Error {

    constructor(key, parameters) {
        super('RecordsNotFoundException')
        this.name = 'RecordsNotFoundException'
        this.messages = [{ key: key, parameters: parameters }]
        Error.captureStackTrace(this, this.constructor)
    }
}

class ApplicationExceptions extends Error {

    constructor(messages) {
        super('ApplicationException')
        this.name = 'ApplicationException'
        if (Array.isArray(messages)) {
            this.messages = messages
        } else {
            this.messages = [messages]
        }
        Error.captureStackTrace(this, this.constructor)
    }
}

class ApplicationErrorMessage {

    constructor(key, parameters) {
        this.key = key
        this.parameters = parameters
    }
}

class ApplicationErrors {

    constructor() {
        this.messages = new Array()
    }

    isValidObject(validator, json) {
        const { error, value } = validator.validate(json, { abortEarly: false })
        if (error) {
            for (let i = 0; i < error.details.length; i++) {
                const currentErrorDetail = error.details[i]
                const currentErrorMessage = currentErrorDetail.message
                const currentErrorValue = currentErrorDetail.context.value
                if (currentErrorValue) {
                    if (Array.isArray(currentErrorValue)) {
                        this.messages.push(new ApplicationErrorMessage(currentErrorMessage, currentErrorValue))
                    } else {
                        this.messages.push(new ApplicationErrorMessage(currentErrorMessage, [currentErrorValue]))
                    }
                } else {
                    this.messages.push(new ApplicationErrorMessage(currentErrorMessage))
                }
            }
        }
        return value
    }

    isCustomFieldsValid(fieldValues, fieldsMetaData) {
        const fieldKeySet = new Set()
        if (fieldsMetaData.length > 0) {
            fieldsMetaData.forEach(currentFieldMetadata => {
                let currentFieldValue
                if (typeof (fieldValues) != 'undefined') {
                    currentFieldValue = fieldValues[currentFieldMetadata.key]
                } else {
                    currentFieldValue = fieldValues
                }
                if (typeof (currentFieldValue) === 'undefined') {
                    if (currentFieldMetadata.required) {
                        this.messages.push(new ApplicationErrorMessage(constants.CUSTOM_FIELD_REQUIRED, currentFieldMetadata.key))
                    }
                } else {
                    // so that we can use the same logic for validating fields whether they are in an array or not we are pushing the instances where the field
                    // is not a list into an array, the negative of this approach is the unnecessary for loop in the case the field is of list type but should be minimal
                    let currentFieldValues = currentFieldValue
                    if (currentFieldMetadata.list) {
                        if (!Array.isArray(currentFieldValues)) {
                            this.messages.push(new ApplicationErrorMessage(constants.CUSTOM_FIELD_IS_LIST, currentFieldMetadata.key))
                            return
                        }
                    } else {
                        if (Array.isArray(currentFieldValues)) {
                            this.messages.push(new ApplicationErrorMessage(constants.CUSTOM_FIELD_IS_NOT_A_LIST, currentFieldMetadata.key))
                            return
                        }
                        currentFieldValues = [currentFieldValue]
                    }
                    for (let i = 0; i < currentFieldValues.length; i++) {
                        if (currentFieldMetadata.options) {
                            let optionsMatch = false
                            for (let j = 0; j < currentFieldMetadata.options.length; j++) {
                                if (currentFieldMetadata.options[j] === currentFieldValues[i]) {
                                    optionsMatch = true
                                    break
                                }
                            }
                            if (!optionsMatch) {
                                this.messages.push(new ApplicationErrorMessage(constants.CUSTOM_FIELD_INVALID_OPTION, [currentFieldMetadata.key, currentFieldValue, currentFieldMetadata.options]))
                            }
                        } else {
                            let invalidFieldType = true
                            switch (currentFieldMetadata.type) {
                                case constants.CUSTOM_FIELD_TYPE_BOOLEAN:
                                    if (typeof currentFieldValues[i] === 'boolean') invalidFieldType = false;
                                    break
                                case constants.CUSTOM_FIELD_TYPE_STRING:
                                    if (typeof currentFieldValues[i] === 'string') invalidFieldType = false;
                                    break
                                case constants.CUSTOM_FIELD_TYPE_INTEGER:
                                    if (Number.isInteger(currentFieldValues[i])) invalidFieldType = false;
                                    break
                                case constants.CUSTOM_FIELD_TYPE_DECIMAL:
                                    if (Number.isInteger(currentFieldValues[i])) invalidFieldType = false;
                                    break 
                                case constants.CUSTOM_FIELD_TYPE_DATE:
                                    if (isoDatestringValidator.isValidDate(currentFieldValues[i])) invalidFieldType = false;
                                    break 
                                case constants.CUSTOM_FIELD_TYPE_TIME:
                                    if (isoDatestringValidator.isValidTime(currentFieldValues[i])) invalidFieldType = false;
                                    break 
                                case constants.CUSTOM_FIELD_TYPE_DATETIME:
                                    if (isoDatestringValidator.isValidISODateString(currentFieldValues[i])) invalidFieldType = false;
                                    break 
                            }
                            if (invalidFieldType) {
                                this.messages.push(new ApplicationErrorMessage(constants.CUSTOM_FIELD_TYPE_IS_INVALID, [currentFieldMetadata.key, currentFieldMetadata.type]))
                            }
                        }
                    }
                }
                fieldKeySet.add(currentFieldMetadata.key)
            })
            for (let fieldKey in fieldValues) {
                if (!fieldKeySet.has(fieldKey)) {
                    this.messages.push(new ApplicationErrorMessage(constants.CUSTOM_FIELD_IS_INVALID, [fieldKey]))
                }
            }
        } else {
            if (fieldValues && Object.keys(fieldValues).length !== 0) {
                this.messages.push(new ApplicationErrorMessage(constants.CUSTOM_FIELDS_NOT_FOUND))
            }
        }
    }

    isEmptyArray(array, message) {
        if (!array || !array.length || array.length == 0) {
            this.messages.push(new ApplicationErrorMessage(message))
        }
    }

    raiseExceptionIfHasErrors() {
        if (this.messages.length > 0) {
            throw new ApplicationExceptions(this.messages)
        }
    }

    addErrorMessage(message) {
        return this.messages.push(new ApplicationErrorMessage(message))
    }

    addErrorMessage(message, parameters) {
        return this.messages.push(new ApplicationErrorMessage(message, parameters))
    }
}

module.exports = { SystemException, ApplicationException, RecordsNotFoundException, ApplicationErrors, ApplicationErrorMessage }