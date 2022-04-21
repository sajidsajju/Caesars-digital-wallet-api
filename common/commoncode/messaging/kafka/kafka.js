const config = require('dcp-config')
const constants = require('commonconstants')
const als = require('async-local-storage')
const { Kafka } = require('kafkajs')

const kafka = new Kafka({
    brokers: [config.getProperty('dcp.messenger.kafka.address')]
})
const channelConfigurations = config.getProperty('dcp.messenger.kafka.channels')

function getChannelConfiguration(channel) {
    return channelConfigurations[channel]
}

exports.messageSender = (channel) => {
    const correlationId = new Buffer.from(als.get(constants.KEY_CORRELATION_ID)).toString('ascii')
    const tenant = new Buffer.from(als.get(constants.KEY_TENANT)).toString('ascii')
    const channelConfiguration = getChannelConfiguration(channel)
    const messageSender = async(payload) => {
        const producer = kafka.producer({ groupId: channelConfiguration.groupId })
        const headers = {}
        headers['X-TENANT'] = tenant
        headers['X-CORRELATION-ID'] = correlationId

        await producer.connect()
        await producer.send({
            topic: channelConfiguration.topic,
            messages: [{
                value: JSON.stringify(payload),
                headers
            }]
        })
        await producer.disconnect()
    }
    return messageSender
}

exports.messageReceiver = async(channel, handler) => {
    const channelConfiguration = getChannelConfiguration(channel)

    const consumer = kafka.consumer({ groupId: channelConfiguration.groupId })
    await consumer.connect()
    await consumer.subscribe({ topic: channelConfiguration.topic })
    await consumer.run({
        eachMessage: async({ topic, partition, message }) => {
            als.scope()
            als.set(constants.KEY_TENANT, message.headers["X-TENANT"])
            als.set(constants.KEY_CORRELATION_ID, message.headers['X-CORRELATION-ID'])
            handler(JSON.parse(message.value))
        }
    })
}