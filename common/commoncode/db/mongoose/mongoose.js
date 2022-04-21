const config = require('dcp-config')
const logger = require('dcp-logger')
const mongoose = require('mongoose')

require('dotenv').config()
const AUTHORIZATION_DB = 'admin'

async function mongooseLoader() {
    let databaseUrl = 'mongodb://'

    const username = process.env.DB_USERNAME;
    const password = process.env.DB_PASSWORD;

    const securedConnection = username && password

    let auth = undefined
    if (securedConnection) {
        auth = {}
        auth.authdb = AUTHORIZATION_DB
        auth.user = username
        auth.password = password
    }

    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;

    databaseUrl += host + ':' + port
    databaseUrl += '/' + config.getProperty('dcp.repository.mongodb.database')

    //Embedded mongo
    // let embeddedDB = process.env.EMBEDDED_DB;

    // if (embeddedDB) {
    //     let mongo = new MongoMemoryServer()
    //     databaseUrl = await mongo.getUri()
    // }

    logger.info(databaseUrl);

    let connection = await mongoose.connect(databaseUrl, {
        auth,
        authSource: AUTHORIZATION_DB,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })

    return connection.connection.db
}

if (config.getProperty('dcp.repository.mongodb.autoconfig', false)) {
    mongoose.plugin(schema => {
        schema.pre('findOneAndUpdate', setRunValidators);
        schema.pre('updateMany', setRunValidators);
        schema.pre('updateOne', setRunValidators);
        schema.pre('update', setRunValidators);
    })

    function setRunValidators() {
        this.setOptions({ runValidators: true })
    }
}

module.exports = mongooseLoader