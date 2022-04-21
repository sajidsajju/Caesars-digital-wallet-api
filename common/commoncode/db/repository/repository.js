const { ApplicationException, SystemException } = require('dcp-errors')
const als = require('async-local-storage')
const constants = require('commonconstants')
const logger = require('dcp-logger')
const moment = require('moment')
const mongoose = require('mongoose');

class Query {

    constructor(criteria, projection, sort) {
        this.criteria = criteria
        this.projection = projection
        this.sort = sort
    }

}

class QueryBuilder {

    constructor(model) {
        this.model = model

        this.criteria = {}
        this.criteriaChild = undefined
        this.criteriaToUpdate = this.criteria

        this.retrieveInactive = false
        this.childFieldName = undefined

        this.projection = ''
        this.sorting = undefined

        this.match(constants.SCHEMA_TENANT, als.get(constants.KEY_TENANT))
    }

    // Once child is called all criteria are added to the child query so call only after all parent queries have been added
    child(childFieldName) {
        this.criteriaChild = {}
        this.criteriaToUpdate = this.criteriaChild
        this.childFieldName = childFieldName
        this.include(childFieldName)
    }

    // Adds criteria to parent until child is called. After child is called all criteria is added to the child query criteria
    match(field, value, options) {
        let isMultiValue = Array.isArray(value)
        let isMultiField = Array.isArray(field)
        let textMatch = false
        if (typeof (options) !== 'undefined') {
            if (typeof (options.textMatch) !== 'undefined') {
                textMatch = options.textMatch
            }
        }
        let queryValue
        if (isMultiValue) {
            if (!textMatch) {
                // in array exact match
                queryValue = {
                    $in: value // value is actually an array here
                }
            } else {
                // in array regular expression match
                let currentValues = []
                for (let i = 0; i < value.length; i++) {
                    currentValues.push({
                        $regex: value[i],
                        $options: 'i'
                    })
                }
                queryValue = currentValues
            }
        } else {
            if (!textMatch) {
                // exact match
                queryValue = value
            } else {
                // regular expression match
                queryValue = {
                    $regex: value,
                    $options: 'i'
                }
            }
        }
        if (!isMultiField) {
            // values must match any one of the fields
            this.criteriaToUpdate[field] = queryValue
        } else {
            if (field.length <= 1) {
                // if the array of field names is empty or a single field then this is an error
                // For single fields do not pass them in an array so that it wont get considered as a multi field query her
                throw new SystemException(constants.ERROR_REPOSITORY_UNEXPECTED)
            }
            if (typeof (this.criteriaToUpdate.$and) == 'undefined') {
                this.criteriaToUpdate.$and = []
            }
            if (isMultiValue) {
                let currentConditions = []

                for (let j = 0; j < queryValue.length; j++) {
                    currentConditions = []
                    for (let i = 0; i < field.length; i++) {
                        let currentCondition = {}
                        currentCondition[field[i]] = queryValue[j]
                        currentConditions.push(currentCondition)
                    }
                    this.criteriaToUpdate.$and.push({ $or: currentConditions })
                }
            } else {
                let currentConditions = []
                for (let i = 0; i < field.length; i++) {
                    let currentCondition = {}
                    currentCondition[field[i]] = queryValue
                    currentConditions.push(currentCondition)
                }
                this.criteriaToUpdate.$and.push({ $or: currentConditions })
            }
        }
    }

    sort(sortFields) {
        this.sorting = {}
        for (let i = 0; i < sortFields.length; i++) {
            const fieldName = sortFields[i].fieldName
            const isAscending = sortFields[i].sortDirection === constants.SORT_DIRECTION_ASCENDING
            this.sorting[fieldName] = isAscending ? 1 : -1
        }
    }

    inactive(retrieveInactive, refTimestamp) {
        if (!refTimestamp) {
            refTimestamp = Date.now();
        }
        if (!retrieveInactive) {
            const refDate = moment(refTimestamp).format('YYYY-MM-DD')
            const throughDateNull = {},
                fromDateNull = {},
                throughDateGte = {},
                fromDateLte = {}

            throughDateNull[constants.SCHEMA_THROUGH_DATE] = null
            throughDateGte[constants.SCHEMA_THROUGH_DATE] = { $gte: refDate }

            fromDateNull[constants.SCHEMA_FROM_DATE] = null
            fromDateLte[constants.SCHEMA_FROM_DATE] = { $lte: refDate }

            if (typeof (this.criteriaToUpdate.$and) == 'undefined') {
                this.criteriaToUpdate.$and = []
            }

            this.criteriaToUpdate.$and.push({ $or: [throughDateNull, throughDateGte] }, { $or: [fromDateNull, fromDateLte] })
        }

        this.retrieveInactive = retrieveInactive
    }

    exclude(fieldName) {
        if (this.projection.length > 0) {
            this.projection += ' '
        }
        this.projection += ('-' + fieldName)
    }

    include(fieldName) {
        if (this.projection.length > 0) {
            this.projection += ' '
        }
        this.projection += fieldName
    }

    build() {
        let criteria = {}
        if (this.criteriaChild) {
            // _id needs special handling in the aggregate pipeline https://stackoverflow.com/questions/36193289/moongoose-aggregate-match-does-not-match-ids
            if (this.criteria[constants.SCHEMA_ID]) {
                this.criteria[constants.SCHEMA_ID] = mongoose.Types.ObjectId(this.criteria[constants.SCHEMA_ID])
            }
            let that = this

            const childFieldSchemaId = this.childFieldName + '.' + constants.SCHEMA_ID
            if (this.criteriaChild[childFieldSchemaId]) {
                this.criteriaChild[childFieldSchemaId] = mongoose.Types.ObjectId(this.criteriaChild[childFieldSchemaId])
            }

            // Child query involved so build an aggregate query
            const aggregatePipeline = []
            aggregatePipeline.push({ $match: this.criteria })
            aggregatePipeline.push({ $unwind: '$' + this.childFieldName })
            aggregatePipeline.push({ $match: this.criteriaChild })

            let childModel = this.model.schema.paths[that.childFieldName]
            let aggregateProjection = childModel.__projection
            if (!aggregateProjection) {
                aggregateProjection = {}
                Object.keys(childModel.schema.paths).forEach(function (fieldName, fieldIndex) {
                    if (fieldName.indexOf('.$') == -1) {
                        aggregateProjection[fieldName] = '$' + that.childFieldName + '.' + fieldName
                    }
                })
                aggregateProjection[constants.SCHEMA_ID] = false
                aggregateProjection[constants.SCHEMA_EXTERNAL_ID] = '$' + this.childFieldName + '.' + constants.SCHEMA_ID

                childModel.__projection = aggregateProjection
            }
            aggregatePipeline.push({ $project: aggregateProjection })
            criteria = aggregatePipeline
        } else {
            // tenant field is only on the parent document hence excluding only here 
            this.exclude(constants.SCHEMA_TENANT)
            criteria = this.criteria
        }
        let projection = this.projection.length > 0 ? this.projection : null
        return new Query(criteria, projection, this.sorting)
    }

}

const readonlyFields = [
    constants.SCHEMA_TENANT,
    constants.SCHEMA_ID,
    constants.SCHEMA_EXTERNAL_ID,
    constants.SCHEMA_CREATED_BY,
    constants.SCHEMA_CREATED_DATE,
    constants.SCHEMA_MODIFIED_BY,
    constants.SCHEMA_MODIFIED_DATE
]

class Repository {

    constructor(model, idFieldName, childIdFieldName) {
        this.model = model
        if (typeof (idFieldName) !== 'undefined') {
            this.idFieldName = idFieldName
        } else {
            this.idFieldName = constants.SCHEMA_ID
        }
        if (typeof (childIdFieldName) !== 'undefined') {
            // Ideally we should never have to override this as all child ID's are constants.SCHEMA_ID
            this.childIdFieldName = childIdFieldName
        } else {
            this.childIdFieldName = constants.SCHEMA_ID
        }
    }

    processCreateEntityFields(entity, now, childEntityId) {
        if (typeof (entity.createdBy) === 'undefined') {
            throw new ApplicationException(constants.CREATED_BY_NOT_PROVIDED)
        }
        if (typeof (childEntityId) !== 'undefined') {
            entity[this.childIdFieldName] = childEntityId
        } else {
            entity[this.childIdFieldName] = undefined
        }
        entity.createdDate = now
        entity.modifiedDate = now
        entity.modifiedBy = entity.createdBy

        this.processActivableEntityFields(entity)

        return entity
    }

    processUpdateEntityFields(childFieldNamePrefix, entity, now, deltaOnly) {
        let isChildUpdate = typeof (childFieldNamePrefix) !== 'undefined'
        if (typeof (entity.modifiedBy) === 'undefined') {
            throw new ApplicationException(constants.MODIFIED_BY_NOT_PROVIDED)
        }
        this.processActivableEntityFields(entity)

        let updateFieldsSet = {}
        let updateFieldsUnset = undefined
        let that = this
        let updatePaths
        if (deltaOnly) {
            updatePaths = entity
        } else {
            updatePaths = isChildUpdate ? this.model.schema.paths[childFieldNamePrefix].schema.paths : this.model.schema.paths
        }
        Object.keys(updatePaths).forEach(function (fieldName, fieldIndex) {
            if ((isChildUpdate ? (fieldName === that.childIdFieldName) : (fieldName === that.idFieldName)) // dont update parent or child ids
                ||
                (fieldName.indexOf('$') != -1) // dont update object sub fields
                ||
                (fieldName.indexOf('_') == 0) // dont update special fields e.g. _v should not get set or unset
                ||
                (readonlyFields.findIndex(function (fieldInArray) { return fieldInArray === fieldName }) != -1) // dont update read only fields
                ||
                (!isChildUpdate && updatePaths[fieldName].instance === 'Array' && fieldName !== 'addresses')) // array fields should not get set or unset for parent documents
            {
                return
            }
            let fieldNameComponents = fieldName.split('.')
            let fieldValue = entity[fieldNameComponents[0]]
            for (let i = 1; i < fieldNameComponents.length; i++) {
                if (typeof (fieldValue) != 'undefined') {
                    fieldValue = fieldValue[fieldNameComponents[i]]
                }
            }
            let fieldNameToUpdate
            if (isChildUpdate) {
                fieldNameToUpdate = childFieldNamePrefix + ".$." + fieldName
            } else {
                fieldNameToUpdate = fieldName
            }
            if (deltaOnly || typeof (fieldValue) !== 'undefined') {
                updateFieldsSet[fieldNameToUpdate] = fieldValue
            } else {
                if (!updateFieldsUnset) {
                    updateFieldsUnset = {}
                }
                updateFieldsUnset[fieldNameToUpdate] = ""
            }
        })
        // Override modified date with our own modified date to prevent the sender from
        // tampering with their own modified date
        if (isChildUpdate) {
            // Update child node modified date if applicable
            updateFieldsSet[childFieldNamePrefix + ".$." + constants.SCHEMA_MODIFIED_DATE] = now
            updateFieldsSet[childFieldNamePrefix + ".$." + constants.SCHEMA_MODIFIED_BY] = entity.modifiedBy
        }
        // update parent node modified date always
        updateFieldsSet[constants.SCHEMA_MODIFIED_DATE] = now
        updateFieldsSet[constants.SCHEMA_MODIFIED_BY] = entity.modifiedBy

        let updateFields = {}
        updateFields.$set = updateFieldsSet
        if (updateFieldsUnset) {
            updateFields.$unset = updateFieldsUnset
        }
        return updateFields
    }

    processActivableEntityFields(activableEntity) {
        const fromDateType = typeof (activableEntity.fromDate)
        if (fromDateType !== 'undefined') {
            if (fromDateType === 'string') {
                activableEntity.fromDate = new Date(activableEntity.fromDate)
            }
            activableEntity.fromDate.setUTCHours(0, 0, 0, 0)
        }
        const throughDateType = typeof (activableEntity.throughDate)
        if (throughDateType !== 'undefined') {
            if (throughDateType === 'string') {
                activableEntity.throughDate = new Date(activableEntity.throughDate)
            }
            activableEntity.throughDate.setUTCHours(23, 59, 59, 999)
        }
    }

    // Create a new entity
    create(entity) {
        return new Promise((resolve, reject) => {
            const entityToSave = new this.model(entity)

            const now = Date.now()
            this.processCreateEntityFields(entityToSave, now)

            const tenant = als.get(constants.KEY_TENANT)
            entityToSave[constants.SCHEMA_TENANT] = tenant

            return entityToSave.save().then(entityInDB => {
                resolve(entityInDB)
            }).catch(error => {
                if (error.name == 'ApplicationException') {
                    reject(error)
                } else {
                    reject(new SystemException(constants.ERROR_REPOSITORY_UNEXPECTED, error))
                }
            })
        })
    }

    // Find a single entity
    findOne(query) {
        let findOneQuery = this.model.findOne(query.criteria)
        if (query.projection) {
            findOneQuery.projection(query.projection)
        }
        if (query.sort) {
            findOneQuery.sort(query.sort)
        }
        return new Promise((resolve, reject) => {
            findOneQuery.then(result => {
                resolve(result)
            }).catch(error => {
                reject(new SystemException(constants.ERROR_REPOSITORY_UNEXPECTED, error))
            })
        })
    }

    // Find multiple entities without paging
    find(query) {
        let findQuery = this.model.find(query.criteria)
        if (query.projection) {
            findQuery.projection(query.projection)
        }
        if (query.sort) {
            findQuery.sort(query.sort)
        }
        return new Promise((resolve, reject) => {
            findQuery.then(results => {
                resolve(results)
            }).catch(error => {
                reject(new SystemException(constants.ERROR_REPOSITORY_UNEXPECTED, error))
            })
        })
    }

    // Find multiple entities with paging
    findPage(query, pageNumber, itemsPerPage) {
        if (!pageNumber && !itemsPerPage) {
            return this.find(query)
        }
        if (pageNumber < 1 || itemsPerPage < 1) {
            // page number indexes must start from 1 and items per page cannot be less than 1
            throw new SystemException(constants.ERROR_REPOSITORY_UNEXPECTED)
        }
        let criteria = query.criteria
        let options = {}
        if (query.projection) {
            options.projection = query.projection
        }
        if (query.sort) {
            options.sort = query.sort
        }
        options.page = pageNumber
        options.limit = itemsPerPage
        return new Promise((resolve, reject) => {
            this.model.paginate(criteria, options).then(results => {
                let records = {
                    records: results.docs,
                    pagination: {
                        pageNumber: results.page,
                        itemsPerPage: results.limit,
                        numberOfPages: results.totalPages,
                        totalNumberOfRecords: results.totalDocs
                    }
                }
                resolve(records)
            }).catch(error => {
                reject(new SystemException(constants.ERROR_REPOSITORY_UNEXPECTED, error))
            })
        })
    }

    // Update an existing entity
    update(entityId, entity, deltaOnly) {
        return new Promise((resolve, reject) => {
            let query = {}
            query[constants.SCHEMA_TENANT] = als.get(constants.KEY_TENANT)
            query[this.idFieldName] = entityId

            const now = Date.now()
            let entityUpdateQuery = this.processUpdateEntityFields(undefined, entity, now, deltaOnly)

            this.model.updateOne(query, entityUpdateQuery).then(result => {
                if (result.nModified != 1) {
                    reject(new ApplicationException(constants.RECORDS_NOT_UPDATED, entityId))
                } else {
                    resolve()
                }
            }).catch(error => {
                reject(new SystemException(constants.ERROR_REPOSITORY_UNEXPECTED, error))
            })
        })
    }

    // Delete entities for the given entityIds
    delete(keys, keyField) {
        return new Promise((resolve, reject) => {
            let query = {}
            query[constants.SCHEMA_TENANT] = als.get(constants.KEY_TENANT)
            if (typeof (keyField) === 'undefined') {
                keyField = this.idFieldName
            }
            query[keyField] = keys
            this.model.deleteMany(query).then(result => {
                const deleteCountActual = result.deletedCount
                if (deleteCountActual == 0) {
                    reject(new ApplicationException(constants.RECORDS_NOT_DELETED))
                } else {
                    resolve()
                }
            }).catch(error => {
                reject(new SystemException(constants.ERROR_REPOSITORY_UNEXPECTED, error))
            })
        })
    }

    // Create a new child entity
    createInChild(entityId, childFieldName, childEntity) {
        return new Promise((resolve, reject) => {
            const now = Date.now()
            const childEntityId = mongoose.Types.ObjectId()

            let documentLocatorQuery = {}
            documentLocatorQuery[this.idFieldName] = entityId
            documentLocatorQuery[constants.SCHEMA_TENANT] = als.get(constants.KEY_TENANT)
            this.processCreateEntityFields(childEntity, now, childEntityId)

            let createQuery = {}
            createQuery[childFieldName] = childEntity
            this.model.updateOne(documentLocatorQuery, { $push: createQuery }).then(result => {
                if (result.nModified != 1) {
                    reject(new ApplicationException(constants.RECORDS_NOT_FOUND, childEntityId))
                } else {
                    resolve(childEntity)
                }
            }).catch(error => {
                reject(new SystemException(constants.ERROR_REPOSITORY_UNEXPECTED, error))
            })
        })
    }

    // Find multiple child entities for the given criteria without paging
    findInChild(query) {
        let aggregateQuery = this.model.aggregate(query.criteria)
        if (query.sort) {
            aggregateQuery.sort(query.sort)
        }
        return new Promise((resolve, reject) => {
            aggregateQuery.then(results => {
                resolve(results)
            }).catch(error => {
                reject(new SystemException(constants.ERROR_REPOSITORY_UNEXPECTED, error))
            })
        })
    }

    // Find multiple child entities for the given criteria with paging
    findPageInChild(query, pageNumber, itemsPerPage) {
        if (!pageNumber && !itemsPerPage) {
            return this.findInChild(query)
        }
        if (pageNumber < 1 || itemsPerPage < 1) {
            // page number indexes must start from 1 and items per page cannot be less than 1
            throw new SystemException(constants.ERROR_REPOSITORY_UNEXPECTED)
        }
        let criteria = this.model.aggregate(query.criteria)
        let options = {}
        if (query.sort) {
            options.sort = query.sort
        }
        options.page = pageNumber
        options.limit = itemsPerPage
        return new Promise((resolve, reject) => {
            this.model.aggregatePaginate(criteria, options).then(results => {
                let records = {
                    records: results.docs,
                    pagination: {
                        pageNumber: results.page,
                        itemsPerPage: results.limit,
                        numberOfPages: results.totalPages,
                        totalNumberOfRecords: results.totalDocs
                    }
                }
                resolve(records)
            }).catch(error => {
                reject(new SystemException(constants.ERROR_REPOSITORY_UNEXPECTED, error))
            })
        })
    }

    // Update an existing child entity
    updateInChild(entityId, childEntityId, childFieldName, childEntity, deltaOnly) {
        return new Promise((resolve, reject) => {
            const now = Date.now()

            let documentLocatorQuery = {}
            documentLocatorQuery[this.idFieldName] = entityId
            documentLocatorQuery[childFieldName + "." + this.childIdFieldName] = childEntityId
            let childUpdateQuery = this.processUpdateEntityFields(childFieldName, childEntity, now, deltaOnly)
            this.model.updateOne(documentLocatorQuery, childUpdateQuery).then(result => {
                if (result.nModified != 1) {
                    reject(new ApplicationException(constants.RECORDS_NOT_FOUND, childEntityId))
                } else {
                    resolve()
                }
            }).catch(error => {
                reject(new SystemException(constants.ERROR_REPOSITORY_UNEXPECTED, error))
            })
        })
    }

    // Delete child entities for the given entityIds
    deleteFromChild(entityId, childEntityIds, childFieldName) {
        return new Promise((resolve, reject) => {
            let documentLocatorQuery = {}
            documentLocatorQuery[this.idFieldName] = entityId
            documentLocatorQuery[childFieldName + "." + this.childIdFieldName] = childEntityIds
            let childDeleteQuery = {}
            childDeleteQuery[childFieldName] = {}
            childDeleteQuery[childFieldName][this.childIdFieldName] = { $in: childEntityIds }
            this.model.updateOne(documentLocatorQuery, { $pull: childDeleteQuery }).then(result => {
                if (result.nModified != 1) {
                    reject(new ApplicationException(constants.RECORDS_NOT_FOUND, childEntityIds))
                } else {
                    resolve()
                }
            }).catch(error => {
                reject(new SystemException(constants.ERROR_REPOSITORY_UNEXPECTED, error))
            })
        })
    }
}

exports.Repository = Repository
exports.Query = Query
exports.QueryBuilder = QueryBuilder