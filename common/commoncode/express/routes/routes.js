const getArrayParameter = (arrayField) => {
    if (typeof (arrayField) !== 'undefined') {
        if (!Array.isArray(arrayField)) {
            return arrayField.split(',')
        } else {
            return arrayField
        }
    }
}

const getBooleanParameter = (booleanField) => {
    if (typeof (booleanField) != 'undefined') {
        if (booleanField === 'true') {
            booleanField = true
        } else if (booleanField === 'false') {
            booleanField = false
        }
    }
    return booleanField
}

module.exports = { getArrayParameter, getBooleanParameter }