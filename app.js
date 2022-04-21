const config = require("dcp-config");
const logger = require("dcp-logger");
const { loadExpressJS, startExpressJS } = require("dcp-express");
const loadFrameworks = require("dcp-loader");
const routes = require("./routes");
const swaggerDocument = require("./swagger/digitalwallet.json");

//connecting to postgreql
const { Client } = require("pg");

const client = new Client({
  user: "eksworkshop",
  host: "rds-eksworkshop.chfwvmzhau3x.us-west-2.rds.amazonaws.com",
  database: "eksworkshop",
  password: "7789fa547b975682fbd65ad21f9c2666",
  port: 5432,
});

function checkEnvVariable() {
  let missingEnvVar = [];

  if (!process.env.DB_USERNAME) {
    missingEnvVar.push("DB_USERNAME");
  }
  if (!process.env.DB_PASSWORD) {
    missingEnvVar.push("DB_PASSWORD");
  }
  if (!process.env.DB_HOST) {
    missingEnvVar.push("DB_HOST");
  }
  // if (!process.env.DB_PORT) {
  //     missingEnvVar.push('DB_PORT')
  // }
  if (!process.env.DB_DATABASE) {
    missingEnvVar.push("DB_DATABASE");
  }
  if (!process.env.STRIKEIRON_USERNAME) {
    missingEnvVar.push("STRIKEIRON_USERNAME");
  }
  if (!process.env.STRIKEIRON_PASSWORD) {
    missingEnvVar.push("STRIKEIRON_PASSWORD");
  }
  if (!process.env.STRIKEIRON_URL) {
    missingEnvVar.push("STRIKEIRON_URL");
  }
  if (!process.env.KAFKA_URL) {
    missingEnvVar.push("KAFKA_URL");
  }

  if (missingEnvVar.length) {
    throw new Error(
      `[app]: Mandatory environment variables are/is missing: ${missingEnvVar.toString()}`
    );
  }
}

checkEnvVariable();

const app = loadExpressJS(routes, swaggerDocument);
async function startServer() {
  await loadFrameworks();
  await startExpressJS(app);
}

startServer();
module.exports = app;
