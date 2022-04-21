const axios = require('axios')
const als = require('async-local-storage');
const constants = require('commonconstants')

// Add a request interceptor
async function axiosLoader() {
    axios.interceptors.request.use(function(config) {
        config.headers[constants.KEY_CORRELATION_ID] = als.get(constants.KEY_CORRELATION_ID)
        config.headers[constants.KEY_TENANT] = als.get(constants.KEY_TENANT)
        return config
    })
}

module.exports = axiosLoader