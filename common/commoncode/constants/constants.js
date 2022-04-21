// service framework constants
exports.KEY_TENANT = 'x-tenant'
exports.KEY_CORRELATION_ID = 'x-correlation-id'

// schema constants
exports.SCHEMA_ID = '_id'
exports.SCHEMA_EXTERNAL_ID = 'id'
exports.SCHEMA_PARENT_ID = 'parentId'
exports.SCHEMA_EXTERNAL_SYSTEM_REF = "externalSystemRef"
exports.SCHEMA_TENANT = 'tenant'

exports.SCHEMA_CODE = 'code'
exports.SCHEMA_PARENT_CODE = 'parentCode'

exports.SCHEMA_TYPE = 'type'

exports.SCHEMA_CREATED_BY = 'createdBy'
exports.SCHEMA_CREATED_DATE = 'createdDate'
exports.SCHEMA_MODIFIED_BY = 'modifiedBy'
exports.SCHEMA_MODIFIED_DATE = 'modifiedDate'

exports.SCHEMA_FROM_DATE = 'fromDate'
exports.SCHEMA_THROUGH_DATE = 'throughDate'

exports.CUSTOM_FIELD_TYPE_BOOLEAN = 'BOOLEAN'
exports.CUSTOM_FIELD_TYPE_STRING = 'STRING'
exports.CUSTOM_FIELD_TYPE_INTEGER = 'INTEGER'
exports.CUSTOM_FIELD_TYPE_DECIMAL = 'DECIMAL'
exports.CUSTOM_FIELD_TYPE_DATE = 'DATE'
exports.CUSTOM_FIELD_TYPE_TIME = 'TIME'
exports.CUSTOM_FIELD_TYPE_DATETIME = 'DATETIME'
exports.CUSTOM_FIELD_TYPE_DOCUMENT = 'DOCUMENT'

exports.ACTION_PRICE_FOL = 'PRICE_FOL'
exports.ACTION_PRICE_FLAT = 'PRICE_FLAT'
exports.ACTION_PRICE_POAC = 'PRICE_POAC'
exports.ACTION_PRICE_POD = 'PRICE_POD'
exports.ACTION_PRICE_POL = 'PRICE_POL'
exports.ACTION_PRICE_POM = 'PRICE_POM'
exports.ACTION_PRICE_PFLAT = 'PRICE_PFLAT'
exports.ACTION_PRICE_WFLAT = 'PRICE_WFLAT'

exports.SORT_DIRECTION_ASCENDING = 'ASCENDING'
exports.SORT_DIRECTION_DESCENDING = 'DESCENDING'

exports.DATE_FORMAT = 'YYYY-MM-DD'

exports.GENDER_MALE = 'Male'
exports.GENDER_FEMALE = 'Female'

// message constants
exports.KEY_TENANT_NOT_FOUND = 'common.tenant.notfound'

exports.RECORDS_NOT_FOUND = 'common.record.notfound'
exports.RECORDS_NOT_CREATED = 'common.record.notcreated'
exports.RECORDS_NOT_MODIFIED = 'common.record.notmodified'
exports.RECORDS_NOT_DELETED = 'common.records.notdeleted'

exports.CREATED_BY_NOT_PROVIDED = 'common.requiredfield.createdby'
exports.MODIFIED_BY_NOT_PROVIDED = 'common.requiredfield.modifiedby'

exports.CUSTOM_FIELD_REQUIRED = 'common.customfield.isrequired'
exports.CUSTOM_FIELD_IS_LIST = 'common.customfield.islist'
exports.CUSTOM_FIELD_IS_NOT_A_LIST = 'common.customfield.isnotalist'
exports.CUSTOM_FIELD_TYPE_IS_INVALID = 'common.customfield.isinvalidtype'
exports.CUSTOM_FIELD_INVALID_OPTION = 'common.customfield.invalidoption'
exports.CUSTOM_FIELD_IS_INVALID = 'common.customfield.isinvalid'
exports.CUSTOM_FIELDS_NOT_FOUND = 'common.customfields.notfound'

exports.CAESARS = 'Caesars'

exports.ERROR_REPOSITORY_UNEXPECTED = 'common.repositoryerror.unexpected'
exports.ERROR_TENANT_HEADER_NOT_PROVIDED = 'common.tenant.isrequired'
exports.ERROR_SERVICE_CALL_UNEXPECTED = 'common.servicecall.unexpected'
exports.ERROR_TENANT_IS_NOT_CORRECT = 'common.tenant.isnotcorrect'
exports.ERROR_CONTENT_TYPE_HEADER_VALUE_INVALID = 'content-type.header.value.invalid'
exports.EMPLOYEE = 'employee'
exports.PARTNER = 'partner'
