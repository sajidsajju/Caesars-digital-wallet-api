const mongooseLoader = require('dcp-mongoose')
const axiosLoader = require('dcp-axios')
const config = require('dcp-config')
const logger = require('dcp-logger')

async function loadFrameworks() {
    // if (config.getProperty('dcp.repository.mongodb.autoconfig', false)) {
    //     const mongoConnection = await mongooseLoader()
    //     logger.info('Connected to database ...')
    // }

    await axiosLoader()
    logger.info('Axios framework configured ...')
}

module.exports = loadFrameworks