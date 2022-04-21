const config = require('dcp-config')

if (config.getProperty('dcp.messenger.kafka.autoconfig', false)) {
    module.exports = require('dcp-kafka')
}