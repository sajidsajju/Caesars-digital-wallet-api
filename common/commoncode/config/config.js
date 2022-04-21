const fs = require('fs')
const yaml = require('js-yaml')
const { SystemException } = require('dcp-errors')

const CONFIG_FILE_PATH = './application.yml'

let config = {}
try {
    let fileContents = fs.readFileSync(CONFIG_FILE_PATH, 'utf8')
    config = yaml.safeLoad(fileContents)
} catch (error) {
    throw new SystemException('Error loading property file from path: ' + CONFIG_FILE_PATH, error)
}

config.getProperty = (path, defaultValue) => {
    const pathComponents = path.split('.')
    let value = config
    for (let i = 0; i < pathComponents.length; i++) {
        value = value[pathComponents[i]]
        if (typeof(value) === 'undefined') {
            if (typeof(defaultValue) !== 'undefined') {
                value = defaultValue
            }
            break
        }
    }
    if (typeof(value) === 'undefined') {
        throw new SystemException('Error loading property at path: ' + path)
    }
    return value
}

module.exports = config