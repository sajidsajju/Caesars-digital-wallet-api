const { response } = require('express');
var expect = require('chai').expect;

class AbstractEntityTests {

    X_TENANT = 'x-tenant';
    TEST_TENANT_1 = 'test_tenant_1';
    TEST_TENANT_2 = 'test_tenant_2';

    constructor() {
        if (this.constructor == AbstractEntityTests) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    runAbstractEntityTests() {

        before(async () => {
            let tenants = new Array();
            tenants.push(this.TEST_TENANT_1)
            tenants.push(this.TEST_TENANT_2)
            await this.createReferenceDataIfRequired(tenants);
        });

        after(async () => {
            let tenants = new Array();
            tenants.push(this.TEST_TENANT_1)
            tenants.push(this.TEST_TENANT_2)
            await this.cleanupRecordsInDatabase(tenants);
        });

        describe("@@@ Abstract Entity Test @@@", async () => {
            it("It should create record in tenant 1", async () => {
                let model = await this.getCreateTestModel("TEN1", "CREATE", this.TEST_TENANT_1);
                let createdRecordId = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let createdRecords = await this.callServiceToGetAllRecords(this.TEST_TENANT_1, false).then(response => {
                    return response;
                })
                expect(createdRecords).not.empty
                let createdRecord = await this.getRecordWithIdFromList(createdRecords, createdRecordId).then(response => {
                    return response;
                })
                expect(createdRecord).not.eq(undefined)
                await this.validateCreatedRecordData(model, createdRecord).then(result => {
                    expect(result).true
                })
                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_1);
            });
            it("It should create record in tenant 2", async () => {
                let model = await this.getCreateTestModel("TEN2", "CREATE", this.TEST_TENANT_2);
                let createdRecordId = await this.callServiceToCreateRecord(model, this.TEST_TENANT_2).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let createdRecords = await this.callServiceToGetAllRecords(this.TEST_TENANT_2, false).then(response => {
                    return response;
                })
                expect(createdRecords).not.empty
                let createdRecord = await this.getRecordWithIdFromList(createdRecords, createdRecordId).then(response => {
                    return response;
                })
                expect(createdRecord).not.eq(undefined)
                await this.validateCreatedRecordData(model, createdRecord).then(result => {
                    expect(result).true
                })
                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_2);
            });

            it("It should update record", async () => {
                let createModel = await this.getCreateTestModel("TEN1", "CREATE_FOR_UPDATE", this.TEST_TENANT_1);
                let createdRecordId = await this.callServiceToCreateRecord(createModel, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let updateModel = await this.getUpdateTestModel("TEN1", "UPDATE", this.TEST_TENANT_1);
                let updateResponse = await this.callServiceToUpdateRecord(updateModel, createdRecordId, this.TEST_TENANT_1).then(response => {
                    return response
                })
                expect(updateResponse.statusCode).eql(200)
                expect(updateResponse.statusReason).eql('OK')

                let updatedRecords = await this.callServiceToGetAllRecords(this.TEST_TENANT_1, false).then(response => {
                    return response;
                })
                expect(updatedRecords).not.empty
                let updatedRecord = await this.getRecordWithIdFromList(updatedRecords, createdRecordId).then(response => {
                    return response;
                })
                expect(updatedRecord).not.eq(undefined)
                await this.validateUpdatedRecordData(updateModel, updatedRecord).then(result => {
                    expect(result).true
                })
                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_1);
            });
            it("It should fail ,when update record id is invalid", async () => {
                let createModel = await this.getCreateTestModel("TEN1", "CREATE_FOR_INVALID", this.TEST_TENANT_1);
                let createdRecordId = await this.callServiceToCreateRecord(createModel, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let updateModel = await this.getUpdateTestModel("TEN1", "UPDATE_FOR_INVALID", this.TEST_TENANT_1);
                let updateResponse = await this.callServiceToUpdateRecord(updateModel, "111111111111111111111111", this.TEST_TENANT_1).then(response => {
                    return response
                })
                expect(updateResponse.statusCode).eql(400)
                expect(updateResponse.statusReason).eql('Bad Request')

                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_1);
            });

            it("It should get all record", async () => {
                let createModel1 = await this.getCreateTestModel("TEN1", "GETALL1", this.TEST_TENANT_1);
                let createdRecordId1 = await this.callServiceToCreateRecord(createModel1, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId1).not.eq(undefined)
                let createdRecords = await this.callServiceToGetAllRecords(this.TEST_TENANT_1, false).then(response => {
                    return response;
                })
                let createdRecord1 = await this.getRecordWithIdFromList(createdRecords, createdRecordId1).then(response => {
                    return response;
                })
                expect(createdRecord1).not.eq(undefined)
                await this.validateCreatedRecordData(createModel1, createdRecord1).then(result => {
                    expect(result).true
                })

                let recordIds = new Array();
                recordIds.push(createdRecordId1);
                await this.callServiceToDeleteRecord(recordIds, this.TEST_TENANT_1);
            });

            it("It should delete record by ids", async () => {
                let createModel1 = await this.getCreateTestModel("TEN1", "DELETE1", this.TEST_TENANT_1);
                let createdRecordId1 = await this.callServiceToCreateRecord(createModel1, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId1).not.eq(undefined)
                let createModel2 = await this.getCreateTestModel("TEN1", "DELETE2", this.TEST_TENANT_1);
                let createdRecordId2 = await this.callServiceToCreateRecord(createModel2, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId2).not.eq(undefined)
                let recordIds = new Array();
                recordIds.push(createdRecordId1);
                recordIds.push(createdRecordId2);
                let deleteResponse = await this.callServiceToDeleteRecord(recordIds, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(deleteResponse.statusCode).eql(200)
                expect(deleteResponse.statusReason).eql('OK')
            });
            it("It should fail, when invalid record id", async () => {
                let recordIds = new Array();
                recordIds.push("111111111111111111111111");
                let deleteResponse = await this.callServiceToDeleteRecord(recordIds, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(deleteResponse.statusCode).eql(400)
                expect(deleteResponse.statusReason).eql('Bad Request')
            });
        });
    }

    async getCreateTestModel(prefix, suffix, tenant) {
        throw new Error("Method 'getTestModelRecord()' must be implemented.");
    }
    async getUpdateTestModel(prefix, suffix, tenant) {
        throw new Error("Method 'getTestModelRecord()' must be implemented.");
    }
    async callServiceToCreateRecord(model, tenant) {
        throw new Error("Method 'callServiceToCreateRecord(model,tenant)' must be implemented.");
    }
    async callServiceToUpdateRecord(updateModel, recordId, tenant) {
        throw new Error("Method 'callServiceToUpdateRecord(updateModel,tenant)' must be implemented.");
    }
    async callServiceToGetAllRecords(tenant, retrieveInactive) {
        throw new Error("Method 'callServiceToGetAllRecords(tenant)' must be implemented.");
    }
    async callServiceToDeleteRecord(createdRecordIds, tenant) {
        throw new Error("Method 'callServiceToDeleteRecord(createdRecordId,tenant)' must be implemented.");
    }
    async validateCreatedRecordData(expectedModel, actualModel) {
        throw new Error("Method 'validateCreatedRecordData(expectedModel, actualModel)' must be implemented.");
    }
    async validateUpdatedRecordData(expectedModel, actualModel) {
        throw new Error("Method 'validateUpdatedRecordData(expectedModel, actualModel)' must be implemented.");
    }
    async getRecordWithIdFromList(records, recordId) {
        throw new Error("Method 'getRecordWithIdFromList(records, recordId)' must be implemented.");
    }
    async createReferenceDataIfRequired(tenants) {
        throw new Error("Method 'createReferenceDataIfRequired(tenants)' must be implemented.");
    }
    async cleanupRecordsInDatabase(tenants) {
        throw new Error("Method 'cleanupRecordsInDatabase(tenants)' must be implemented.");
    }
}

class AbstractActivableEntityTests extends AbstractEntityTests {
    constructor() {
        super();
        if (this.constructor == AbstractActivableEntityTests) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    runAbstractActivableEntityTests() {
        this.runAbstractEntityTests();

        describe("@@@ Test Activable Entity@@@", async () => {
            it("It should get record, when dates are valid and retrieveInactive is true", async () => {
                let fromDate = await getThreeYearPreviousDate();
                let throughDate = await getThreeYearAfterDate();
                let model = await this.getModelForActivableEntity("ACTIVABLE", "VALID_TRUE", this.TEST_TENANT_1, fromDate, throughDate);
                let createdRecordId = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let createdRecords = await this.callServiceToGetAllRecords(this.TEST_TENANT_1, true).then(response => {
                    return response;
                })
                expect(createdRecords).not.empty
                let createdRecord = await this.getRecordWithIdFromList(createdRecords, createdRecordId).then(response => {
                    return response;
                })
                expect(createdRecord).not.eq(undefined)
                await this.validateCreatedRecordData(model, createdRecord).then(result => {
                    expect(result).true
                })
                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_1);
            });
            it("It should get record, when dates are valid and retrieveInactive is false", async () => {
                let fromDate = await getThreeYearPreviousDate();
                let throughDate = await getThreeYearAfterDate();
                let model = await this.getModelForActivableEntity("ACTIVABLE", "VALID_FALSE", this.TEST_TENANT_1, fromDate, throughDate);
                let createdRecordId = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let createdRecords = await this.callServiceToGetAllRecords(this.TEST_TENANT_1, false).then(response => {
                    return response;
                })
                expect(createdRecords).not.empty
                let createdRecord = await this.getRecordWithIdFromList(createdRecords, createdRecordId).then(response => {
                    return response;
                })
                expect(createdRecord).not.eq(undefined)
                await this.validateCreatedRecordData(model, createdRecord).then(result => {
                    expect(result).true
                })
                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_1);
            });
            it("It should get record, when fromDate null and retrieveInactive is false", async () => {
                let fromDate = undefined
                let throughDate = await getThreeYearAfterDate();
                let model = await this.getModelForActivableEntity("ACTIVABLE", "FROMDATE_NULL_FALSE", this.TEST_TENANT_1, fromDate, throughDate);
                let createdRecordId = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let createdRecords = await this.callServiceToGetAllRecords(this.TEST_TENANT_1, false).then(response => {
                    return response;
                })
                expect(createdRecords).not.empty
                let createdRecord = await this.getRecordWithIdFromList(createdRecords, createdRecordId).then(response => {
                    return response;
                })
                expect(createdRecord).not.eq(undefined)
                await this.validateCreatedRecordData(model, createdRecord).then(result => {
                    expect(result).true
                })
                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_1);
            });
            it("It should get record, when fromDate null and retrieveInactive is true", async () => {
                let fromDate = undefined
                let throughDate = await getThreeYearAfterDate();
                let model = await this.getModelForActivableEntity("ACTIVABLE", "FROMDATE_NULL_TRUE", this.TEST_TENANT_1, fromDate, throughDate);
                let createdRecordId = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let createdRecords = await this.callServiceToGetAllRecords(this.TEST_TENANT_1, true).then(response => {
                    return response;
                })
                expect(createdRecords).not.empty
                let createdRecord = await this.getRecordWithIdFromList(createdRecords, createdRecordId).then(response => {
                    return response;
                })
                expect(createdRecord).not.eq(undefined)
                await this.validateCreatedRecordData(model, createdRecord).then(result => {
                    expect(result).true
                })
                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_1);
            });
            it("It should get record, when throughDate null and retrieveInactive is false", async () => {
                let fromDate = await getThreeYearPreviousDate();
                let throughDate = undefined
                let model = await this.getModelForActivableEntity("ACTIVABLE", "THROUGHDATE_NULL_FALSE", this.TEST_TENANT_1, fromDate, throughDate);
                let createdRecordId = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let createdRecords = await this.callServiceToGetAllRecords(this.TEST_TENANT_1, false).then(response => {
                    return response;
                })
                expect(createdRecords).not.empty
                let createdRecord = await this.getRecordWithIdFromList(createdRecords, createdRecordId).then(response => {
                    return response;
                })
                expect(createdRecord).not.eq(undefined)
                await this.validateCreatedRecordData(model, createdRecord).then(result => {
                    expect(result).true
                })
                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_1);
            });
            it("It should get record, when throughDate null and retrieveInactive is true", async () => {
                let fromDate = await getThreeYearPreviousDate();
                let throughDate = undefined
                let model = await this.getModelForActivableEntity("ACTIVABLE", "THROUGHDATE_NULL_TRUE", this.TEST_TENANT_1, fromDate, throughDate);
                let createdRecordId = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let createdRecords = await this.callServiceToGetAllRecords(this.TEST_TENANT_1, true).then(response => {
                    return response;
                })
                expect(createdRecords).not.empty
                let createdRecord = await this.getRecordWithIdFromList(createdRecords, createdRecordId).then(response => {
                    return response;
                })
                expect(createdRecord).not.eq(undefined)
                await this.validateCreatedRecordData(model, createdRecord).then(result => {
                    expect(result).true
                })
                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_1);
            });
            it("It should get record, when throughDate and fromDate null and retrieveInactive is true", async () => {
                let fromDate = undefined
                let throughDate = undefined
                let model = await this.getModelForActivableEntity("ACTIVABLE", "THROUGH_FROM_DATE_NULL_TRUE", this.TEST_TENANT_1, fromDate, throughDate);
                let createdRecordId = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let createdRecords = await this.callServiceToGetAllRecords(this.TEST_TENANT_1, true).then(response => {
                    return response;
                })
                expect(createdRecords).not.empty
                let createdRecord = await this.getRecordWithIdFromList(createdRecords, createdRecordId).then(response => {
                    return response;
                })
                expect(createdRecord).not.eq(undefined)
                await this.validateCreatedRecordData(model, createdRecord).then(result => {
                    expect(result).true
                })
                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_1);
            });
            it("It should get record, when throughDate and fromDate null and retrieveInactive is false", async () => {
                let fromDate = undefined
                let throughDate = undefined
                let model = await this.getModelForActivableEntity("ACTIVABLE", "THROUGH_FROM_DATE_NULL_FALSE", this.TEST_TENANT_1, fromDate, throughDate);
                let createdRecordId = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let createdRecords = await this.callServiceToGetAllRecords(this.TEST_TENANT_1, false).then(response => {
                    return response;
                })
                expect(createdRecords).not.empty
                let createdRecord = await this.getRecordWithIdFromList(createdRecords, createdRecordId).then(response => {
                    return response;
                })
                expect(createdRecord).not.eq(undefined)
                await this.validateCreatedRecordData(model, createdRecord).then(result => {
                    expect(result).true
                })
                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_1);
            });
            it("It should get record, when throughDate and fromDate are less than current date and retrieveInactive is true", async () => {
                let fromDate = "2000-01-01"
                let throughDate = "2001-01-01"
                let model = await this.getModelForActivableEntity("ACTIVABLE", "THROUGH_FROM_DATE_LESS_TRUE", this.TEST_TENANT_1, fromDate, throughDate);
                let createdRecordId = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let createdRecords = await this.callServiceToGetAllRecords(this.TEST_TENANT_1, true).then(response => {
                    return response;
                })
                expect(createdRecords).not.empty
                let createdRecord = await this.getRecordWithIdFromList(createdRecords, createdRecordId).then(response => {
                    return response;
                })
                expect(createdRecord).not.eq(undefined)
                await this.validateCreatedRecordData(model, createdRecord).then(result => {
                    expect(result).true
                })
                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_1);
            });
            it("It should get record, when throughDate and fromDate are less than current date and retrieveInactive is false", async () => {
                let fromDate = "2000-01-01"
                let throughDate = "2001-01-01"
                let model = await this.getModelForActivableEntity("ACTIVABLE", "THROUGH_FROM_DATE_LESS_FALSE", this.TEST_TENANT_1, fromDate, throughDate);
                let createdRecordId = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let createdRecords = await this.callServiceToGetAllRecords(this.TEST_TENANT_1, false).then(response => {
                    return response;
                })
                let createdRecord = await this.getRecordWithIdFromList(createdRecords, createdRecordId).then(response => {
                    return response;
                })
                expect(createdRecord).eq(undefined)
                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_1);
            });
            it("It should get record, when fromDate greater than througDate", async () => {
                let fromDate = "2021-01-012"
                let throughDate = "2021-01-01"
                let model = await this.getModelForActivableEntity("ACTIVABLE", "THROUGH_FROM_DATE_SAME", this.TEST_TENANT_1, fromDate, throughDate);
                let createdRecordId = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).eq(undefined)
            });
            it("It should get record, when throughDate and fromDate are Swapped", async () => {
                let fromDate = await getThreeYearAfterDate();
                let throughDate = await getThreeYearPreviousDate();
                let model = await this.getModelForActivableEntity("ACTIVABLE", "THROUGH_FROM_DATE_SWAPPED", this.TEST_TENANT_1, fromDate, throughDate);
                let createdRecordId = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).eq(undefined)
            });
        });
    }

    async getModelForActivableEntity(prefix, suffix, tenant, fromDate, throughDate) {
        throw new Error("Method 'getModelForActivableEntity(prefix, suffix, tenant, fromDate, throughDate)' must be implemented.");
    }
}

class AbstractMultiIdsGetEntityTests extends AbstractActivableEntityTests {
    constructor() {
        super();
        if (this.constructor == AbstractMultiIdsGetEntityTests) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }
    runAbstractMultiIdsGetEntityTests() {
        this.runAbstractActivableEntityTests();
        describe("@@@ Get Multi Ids Entity Test @@@", async () => {
            it("It should get record with ids", async () => {
                let model1 = await this.getCreateTestModel("MULTI_ID", "CREATE1", this.TEST_TENANT_1);
                let createdRecordId1 = await this.callServiceToCreateRecord(model1, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId1).not.eq(undefined)
                let model2 = await this.getCreateTestModel("MULTI_ID", "CREATE2", this.TEST_TENANT_1);
                let createdRecordId2 = await this.callServiceToCreateRecord(model2, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId2).not.eq(undefined)
                let externalSystemRefs = new Array();
                let recordIds = new Array();
                recordIds.push(createdRecordId1);
                recordIds.push(createdRecordId2);
                let createdRecords = await this.callServiceToGetRecordsByIds(this.TEST_TENANT_1, externalSystemRefs, recordIds).then(response => {
                    return response;
                })
                expect(createdRecords).not.empty
                let createdRecord1 = await this.getRecordWithIdFromList(createdRecords, createdRecordId1).then(response => {
                    return response;
                })
                expect(createdRecord1).not.eq(undefined)
                await this.validateCreatedRecordData(model1, createdRecord1).then(result => {
                    expect(result).true
                })
                let createdRecord2 = await this.getRecordWithIdFromList(createdRecords, createdRecordId2).then(response => {
                    return response;
                })
                expect(createdRecord2).not.eq(undefined)
                await this.validateCreatedRecordData(model2, createdRecord2).then(result => {
                    expect(result).true
                })
                await this.callServiceToDeleteRecord(recordIds, this.TEST_TENANT_1);
            });
            it("It should fail ,when invalid record ids", async () => {
                let externalSystemRefs = new Array();
                let recordIds = new Array();
                recordIds.push("111111111111111111111111");
                let createdRecords = await this.callServiceToGetRecordsByIds(this.TEST_TENANT_1, externalSystemRefs, recordIds).then(response => {
                    return response;
                })
                if (createdRecords) {
                    expect(createdRecords).to.be.empty
                } else {
                    expect(createdRecords).eq(undefined)
                }
            });
        });
    }

    async callServiceToGetRecordsByIds(tenant, externalSystemRefs, recordIds) {
        throw new Error("Method 'callServiceToGetRecordsByIds(tenant, externalSystemRefs, recordIds)' must be implemented.");
    }
}

class AbstractTypeEntityTests extends AbstractEntityTests {

    constructor() {
        super();
        if (this.constructor == AbstractTypeEntityTests) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    runAbstractTypeEntityTests() {
        this.runAbstractEntityTests();
        describe("@@@ Type Entity Test @@@", async () => {
            it("It should fail, when type already exists", async () => {
                let model = await this.getCreateTestModel("TYPE", "EXISTS", this.TEST_TENANT_1);
                let createdRecordId1 = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId1).not.eq(undefined)
                let createdRecordId2 = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId2).not.eq(undefined)
                await this.callServiceToDeleteRecord(createdRecordId1, this.TEST_TENANT_1);
            });
            it("It should fail, when type code is blank ", async () => {
                let createModel = await this.getCreateTestModel("TYPE_CODE", "BLANK1", this.TEST_TENANT_1);
                let createdRecordId = await this.callServiceToCreateRecord(createModel, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let updateModel = await this.getUpdateTestModel("TYPE_CODE", "BLANK2", this.TEST_TENANT_1);
                let updateResponse = await this.callServiceToUpdateRecord(updateModel, " ", this.TEST_TENANT_1).then(response => {
                    return response
                })
                expect(updateResponse.statusReason).eql('Not Found')

                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_1);
            });
            it("It should fail , when type code is blank", async () => {
                let recordIds = new Array();
                recordIds.push(" ");
                let deleteResponse = await this.callServiceToDeleteRecord(recordIds, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(deleteResponse.statusCode).eql(400)
                expect(deleteResponse.statusReason).eql('Bad Request')
            });
        });
    }
}

class AbstractTypeFieldEntityTests extends AbstractEntityTests {

    //Use for creating type
    TYPE_CODE = "TEST_TYPE_CODE";

    constructor() {
        super();
        if (this.constructor == AbstractTypeFieldEntityTests) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    runAbstractTypeFieldEntityTests() {
        this.runAbstractEntityTests();
        describe("@@@ Abstract Type Field Entity Tests @@@", async () => {
            it("Create type field fail,when type code is invalid", async () => {
                this.TYPE_CODE = "INVALID_TYPE_CODE";
                let model = await this.getCreateTestModel("INVALID", "CODE", this.TEST_TENANT_1);
                let createdRecordId = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).eq(undefined)
                this.TYPE_CODE = "TEST_TYPE_CODE";
            });
            it("Create type field fail,when type code is blank", async () => {
                this.TYPE_CODE = " ";
                let model = await this.getCreateTestModel("INVALID", "CODE", this.TEST_TENANT_1);
                let createdRecordId = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).eq(undefined)
                this.TYPE_CODE = "TEST_TYPE_CODE";
            });
            it("Update type field fail,when type code is invalid", async () => {
                let createModel = await this.getCreateTestModel("INVALID", "TYPE_CODE", this.TEST_TENANT_1);
                let createdRecordId = await this.callServiceToCreateRecord(createModel, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let updateModel = await this.getUpdateTestModel("INVALID", "UPDATE", this.TEST_TENANT_1);
                this.TYPE_CODE = "INVALID_TYPE_CODE";
                let updateResponse = await this.callServiceToUpdateRecord(updateModel, createdRecordId, this.TEST_TENANT_1).then(response => {
                    return response
                })
                expect(updateResponse.statusCode).eql(400)
                expect(updateResponse.statusReason).eql('Bad Request')
                this.TYPE_CODE = "TEST_TYPE_CODE";
                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_1);
            });
            it("Update type field fail,when type code is blank", async () => {
                let createModel = await this.getCreateTestModel("BLANK", "TYPE_CODE", this.TEST_TENANT_1);
                let createdRecordId = await this.callServiceToCreateRecord(createModel, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let updateModel = await this.getUpdateTestModel("BLANK", "UPDATE", this.TEST_TENANT_1);
                this.TYPE_CODE = " ";
                let updateResponse = await this.callServiceToUpdateRecord(updateModel, createdRecordId, this.TEST_TENANT_1).then(response => {
                    return response
                })
                expect(updateResponse.statusCode).eql(400)
                expect(updateResponse.statusReason).eql('Bad Request')
                this.TYPE_CODE = "TEST_TYPE_CODE";
                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_1);
            });
            it("Get all type field fail, when invalid type code", async () => {
                let createModel1 = await this.getCreateTestModel("INVALID_CODE", "GETALL1", this.TEST_TENANT_1);
                let createdRecordId1 = await this.callServiceToCreateRecord(createModel1, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId1).not.eq(undefined)
                this.TYPE_CODE = "INVALID_TYPE_CODE";
                let createdRecords = await this.callServiceToGetAllRecords(this.TEST_TENANT_1, false).then(response => {
                    return response;
                })
                expect(createdRecords).eq(undefined)
                this.TYPE_CODE = "TEST_TYPE_CODE";
                let recordIds = new Array();
                recordIds.push(createdRecordId1);
                await this.callServiceToDeleteRecord(recordIds, this.TEST_TENANT_1);
            });
            it("Get all type field fail, when type code is blank", async () => {
                let createModel1 = await this.getCreateTestModel("BLANK_CODE", "GETALL1", this.TEST_TENANT_1);
                let createdRecordId1 = await this.callServiceToCreateRecord(createModel1, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId1).not.eq(undefined)
                this.TYPE_CODE = " ";
                let createdRecords = await this.callServiceToGetAllRecords(this.TEST_TENANT_1, false).then(response => {
                    return response;
                })
                expect(createdRecords).eq(undefined)
                this.TYPE_CODE = "TEST_TYPE_CODE";
                let recordIds = new Array();
                recordIds.push(createdRecordId1);
                await this.callServiceToDeleteRecord(recordIds, this.TEST_TENANT_1);
            });
            it("Delete type field fail, when invalid type code", async () => {
                let createModel1 = await this.getCreateTestModel("TEN1", "DELETE1", this.TEST_TENANT_1);
                let createdRecordId1 = await this.callServiceToCreateRecord(createModel1, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId1).not.eq(undefined)
                this.TYPE_CODE = "INVALID_TYPE_CODE";
                let typeFieldIds = new Array();
                typeFieldIds.push(createdRecordId1);
                let response = await this.callServiceToDeleteRecord(typeFieldIds, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(response.statusCode).eql(400)
                expect(response.statusReason).eql('Bad Request')

                this.TYPE_CODE = "TEST_TYPE_CODE";
                let recordIds = new Array();
                recordIds.push(createdRecordId1);
                let deleteResponse = await this.callServiceToDeleteRecord(recordIds, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(deleteResponse.statusCode).eql(200)
                expect(deleteResponse.statusReason).eql('OK')
            });
            it("Delete type field fail, when type code is blank", async () => {
                let createModel1 = await this.getCreateTestModel("TEN1", "DELETE1", this.TEST_TENANT_1);
                let createdRecordId1 = await this.callServiceToCreateRecord(createModel1, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId1).not.eq(undefined)
                this.TYPE_CODE = " ";
                let typeFieldIds = new Array();
                typeFieldIds.push(createdRecordId1);
                let response = await this.callServiceToDeleteRecord(typeFieldIds, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(response.statusCode).eql(400)
                expect(response.statusReason).eql('Bad Request')

                this.TYPE_CODE = "TEST_TYPE_CODE";
                let recordIds = new Array();
                recordIds.push(createdRecordId1);
                let deleteResponse = await this.callServiceToDeleteRecord(recordIds, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(deleteResponse.statusCode).eql(200)
                expect(deleteResponse.statusReason).eql('OK')
            });
        });
    }
}
class AbstractFieldEntityTests extends AbstractEntityTests {

    recordId;
    constructor() {
        super();
        if (this.constructor == AbstractFieldEntityTests) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    runAbstractFieldEntityTests() {
        this.runAbstractEntityTests();
        describe("@@@ Abstract Field Entity Test @@@", async () => {
            it("Create field fail, when record id is invalid", async () => {
                let model = await this.getCreateTestModel("INVALID_ID", "CREATE", this.TEST_TENANT_1);
                this.recordId = "111111111111111111111111";
                let createdRecordId = await this.callServiceToCreateRecord(model, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).eq(undefined)
            });
            it("Update field fail, when recordId is invalid", async () => {
                let createModel = await this.getCreateTestModel("INVALID_ID", "CREATE", this.TEST_TENANT_1);
                let createdRecordId = await this.callServiceToCreateRecord(createModel, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId).not.eq(undefined)
                let temId = this.recordId;
                this.recordId = "111111111111111111111111";
                let updateModel = await this.getUpdateTestModel("INVALID_ID", "UPDATE", this.TEST_TENANT_1);
                let updateResponse = await this.callServiceToUpdateRecord(updateModel, createdRecordId, this.TEST_TENANT_1).then(response => {
                    return response
                })
                expect(updateResponse.statusCode).eql(400)
                expect(updateResponse.statusReason).eql('Bad Request')

                this.recordId = temId;
                await this.callServiceToDeleteRecord(createdRecordId, this.TEST_TENANT_1);
            });
            it("Get all field fail, when invalid record id", async () => {
                let createModel1 = await this.getCreateTestModel("INVALID_ID", "GETALL1", this.TEST_TENANT_1);
                let createdRecordId1 = await this.callServiceToCreateRecord(createModel1, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId1).not.eq(undefined)
                let temId = this.recordId;
                this.recordId = "111111111111111111111111";
                let createdRecords = await this.callServiceToGetAllRecords(this.TEST_TENANT_1, false).then(response => {
                    return response;
                })
                expect(createdRecords).eq(undefined)
                this.recordId = temId;
                let recordIds = new Array();
                recordIds.push(createdRecordId1);
                await this.callServiceToDeleteRecord(recordIds, this.TEST_TENANT_1);
            });
            it("Delete field fail, when record id is invalid", async () => {
                let createModel1 = await this.getCreateTestModel("INVALID_ID", "DELETE1", this.TEST_TENANT_1);
                let createdRecordId1 = await this.callServiceToCreateRecord(createModel1, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(createdRecordId1).not.eq(undefined)
                let temId = this.recordId;
                this.recordId = "111111111111111111111111";
                let fieldIds = new Array();
                fieldIds.push(createdRecordId1);
                let response = await this.callServiceToDeleteRecord(fieldIds, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(response.statusCode).eql(400)
                expect(response.statusReason).eql('Bad Request')

                this.recordId = temId;
                let recordIds = new Array();
                recordIds.push(createdRecordId1);
                let deleteResponse = await this.callServiceToDeleteRecord(recordIds, this.TEST_TENANT_1).then(response => {
                    return response;
                })
                expect(deleteResponse.statusCode).eql(200)
                expect(deleteResponse.statusReason).eql('OK')
            });
        });
    }
}
async function getThreeYearPreviousDate() {
    var date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear() - 3;
    let formattedDate = year + "-" + month + "-" + date
    return formattedDate;
}
async function getThreeYearAfterDate() {
    var date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear() + 3;
    let formattedDate = year + "-" + month + "-" + date
    return formattedDate;
}
exports.AbstractFieldEntityTests = AbstractFieldEntityTests
exports.AbstractTypeFieldEntityTests = AbstractTypeFieldEntityTests
exports.AbstractTypeEntityTests = AbstractTypeEntityTests
exports.AbstractMultiIdsGetEntityTests = AbstractMultiIdsGetEntityTests
exports.AbstractActivableEntityTests = AbstractActivableEntityTests
exports.AbstractEntityTests = AbstractEntityTests