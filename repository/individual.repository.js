const { Repository, QueryBuilder } = require('dcp-repository')
const customerModel = require('../models/customer.model')
const constants = require('commonconstants')
const logger = require('dcp-logger')
const pool = require('../database/dbconfig')
const { Client } = require('pg')
const uuid = require('uuid');

class IndividualRepository extends Repository {

    constructor() {
        super(customerModel)
    }

    // Create a new Customer
    async createIndividual(individual) {
        logger.info('[IndividualRepository]: Entered createIndividual')
        const uid = uuid.v4();
        const sqlString = `insert into customer values ('${uid}','${JSON.stringify(individual)}')`
        await pool.query(sqlString);
        logger.info('[IndividualRepository]: Exiting createIndividual')
        return uid;
    }

    // Find all Entities
    async findAllIndividual(retrieveInactive) {
        const sqlString = `Select * from customer`
        let data = await pool.query(sqlString)
        logger.info('[IndividualRepository]: Exiting findAllIndividual')
        return data;
    }

    // Find Individual by UID
    async findIndividualbyUID(uid) {
        logger.info('[IndividualRepository]: Entered findIndividualbyUID')
        const sqlString = `Select * from customer where uid='${uid}'`
        let data = await pool.query(sqlString)
        logger.info('[IndividualRepository]: Exiting findIndividualbyUID')
        return data;
    }

    // Create a new Partner Individual Association
    async associateIndividualPartner(individualPartnerAssociation) {
        logger.info('[IndividualRepository]: Entered associateIndividualPartner')
        const sqlString = `insert into customer_partner values ('${uuid.v4()}','${individualPartnerAssociation.uid}','${JSON.stringify(individualPartnerAssociation)}')`
        let data = await pool.query(sqlString);
        logger.info('[IndividualRepository]: Exiting associateIndividualPartner')
    }

    // Find Individual Identification instruments by UID
    async findIdentificationInstrumentsbyUID(uid) {
        logger.info('[IndividualRepository]: Entered findIdentificationInstrumentsbyUID')
        const sqlString = `Select individualjson::IdentificationInstr as identificationInstr from individual where individualjson::$uid ='${uid}'`
        let data = await pool.query(sqlString)
        logger.info('[IndividualRepository]: Exiting findIdentificationInstrumentsbyUID')
        return data
    }

    //Find Individual by Identification instrument
    async findIndividualbyIdentificationInstrument(idInstr) {
        logger.info('[IndividualRepository]: Entered findIndividualbyIdentificationInstrument')
        let sqlString = `SELECT individualjson FROM individual join table(JSON_TO_ARRAY(individualjson::IdentificationInstr)) tab where tab.table_col::$Number = '${idInstr.Number}' `
        delete idInstr.Number
        for (const property in idInstr) {
            sqlString += `and tab.table_col::$${property} = '${idInstr[property]}'`
        }
        let data = await pool.query(sqlString)
        logger.info('[IndividualRepository]: Exiting findIndividualbyIdentificationInstrument')
        return data
    }

    async findIndividualbyContactMethod(contact) {
        logger.info('[IndividualRepository]: Entered findIndividualbyContactMethod')
        let sqlString = this.contactTypeQueryBuilder(contact)
        let data = await pool.query(sqlString)
        logger.info('[IndividualRepository]: Exiting from findIndividualbyContactMethod')
        return data
    }

    //updating individual if exists
    async updateIndividualRepo(individual, uid) {
        logger.info("[IndividualRepository]: Entered updateIndividualRepo");
        let updatesCondition = this.buildQueryCondition(individual, ",")
        const sqlString = `UPDATE customer SET ${updatesCondition}  WHERE uid ='${uid}'`
        const data = await pool.query(sqlString)
        logger.info("[IndividualRepository]: Exiting updateIndividualRepo");
        return data;
    }

    contactTypeQueryBuilder(contactType) {
        logger.info('[IndividualRepository]: Entered contactTypeQueryBuilder')
        let sqlString = `SELECT individualjson FROM individual `
        let phone_join = `join table(JSON_TO_ARRAY(individualjson::phoneNumbers)) tab1 `
        let mail_join = `join table(JSON_TO_ARRAY(individualjson::mailingAddress)) tab `

        if (contactType.mailingAddress) {
            sqlString += mail_join
        }
        if (contactType.phoneNumbers) {
            sqlString += phone_join
        }
        sqlString += "where "
        let conditions = ""
        conditions = this.searchCondition("individualjson::emailAddress", contactType.emailAddress, conditions)
        conditions = this.searchCondition("tab.table_col", contactType.mailingAddress, conditions)
        conditions = this.searchCondition("tab1.table_col", contactType.phoneNumbers, conditions)

        sqlString += conditions
        logger.info('[IndividualRepository]: Exiting from contactTypeQueryBuilder')
        return sqlString
    }

    searchCondition(columnName, contactMethod, conditions) {
        logger.info('[IndividualRepository]: Entered searchCondition')
        if (!contactMethod) {
            return conditions
        }
        for (const property in contactMethod) {
            conditions += conditions ? ` and ${columnName}::$${property} ='${contactMethod[property]}'`
                : `${columnName}::$${property} ='${contactMethod[property]}'`
        }
        logger.info('[IndividualRepository]: Exiting from searchCondition')
        return conditions
    }

    buildQueryCondition(individual, seperatedWith) {
        logger.info('[IndividualRepository]: Entered buildQueryCondition')
        let query = ""
        for (const key in individual) {
            if (individual[key]) {
                query += query ? `${seperatedWith} customer_json::$${key} = '${individual[key]}'`
                    : `customer_json::$${key} = '${individual[key]}'`
            }
        }
        logger.info('[IndividualRepository]: Exiting buildQueryCondition')
        return query
    }

}

exports.IndividualRepository = IndividualRepository