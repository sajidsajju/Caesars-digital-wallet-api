const Engine = require('json-rules-engine').Engine
const als = require('async-local-storage')
const constants = require('commonconstants')

class RuleEngine {

    constructor() {
        this.ruleEngineFactory = new Map()
    }

    async createRuleInRuleEngine(rule) {
        let factName
        let conditions = rule.conditions.all
        if (typeof (conditions) !== 'undefined') {
            factName = conditions[0].fact
        } else {
            conditions = rule.conditions.any
            factName = conditions[0].fact
        }
        let engine = await this.getRuleEngine()
        if (typeof (engine) === 'undefined') {
            let newEngine = new Engine()
            newEngine.addFact(factName)
            newEngine.addRule(rule)
            await this.updateRuleEngine(newEngine)
        } else {
            engine.addFact(factName)
            engine.addRule(rule)
        }
    }

    async updateRuleInRuleEngine(rule) {
        await this.deleteRuleFromRuleEngine(rule.name)
        await this.createRuleInRuleEngine(rule)
    }

    async deleteRuleFromRuleEngine(ruleName) {
        let engine = await this.getRuleEngine()
        if (typeof (engine) !== 'undefined' && typeof (engine.rules) !== 'undefined') {
            engine.rules.forEach((rule, index) => {
                if (rule.name === ruleName) {
                    delete engine.rules[index]
                    engine.prioritizedRules = null
                }
            })
        }
    }
    async executeRule(facts) {
        let engine = await this.getRuleEngine()
        if (typeof (engine) !== 'undefined') {
            return await engine.run(facts)
        } else {
            return []
        }
    }

    async getRuleEngine() {
        const tenant = als.get(constants.KEY_TENANT)
        return await this.ruleEngineFactory.get(tenant)
    }

    async updateRuleEngine(engine) {
        const tenant = als.get(constants.KEY_TENANT)
        await this.ruleEngineFactory.set(tenant, engine)
    }
}
const ruleEngine = new RuleEngine()
module.exports = { ruleEngine }