const winston = require('winston')
const constants = require('commonconstants')
const als = require('async-local-storage');
const config = require('dcp-config')

const loggingLevel = config.getProperty('logging.level', 'info')
const loggingformat = winston.format.combine(
    winston.format((info) => {
        info.correlationId = als.get(constants.KEY_CORRELATION_ID) || ''
        return info
    })(),
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf(info => `${info.timestamp} [${info.correlationId}] - ${info.level}: ${info.message}`)
)

const logger = winston.createLogger({
    level: loggingLevel,
    transports: [
        new winston.transports.Console({
            format: loggingformat
        })
    ],
    exitOnError: false
})

module.exports = logger