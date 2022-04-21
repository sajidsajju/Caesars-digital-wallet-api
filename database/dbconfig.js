const util = require("util");
// const pg = require("pg");
const mysql = require("mysql");
let pool;

let params =
{
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD
    
 
};


// var pool = new pg.Pool(params);
// pool = pg.createPool(params);

// Ping database to check for common exception errors.
// pool.connect((err, connection) => {
//   if (err) {
//     if (err.code === "PROTOCOL_CONNECTION_LOST") {
//       console.error("Database connection was closed.");
//     }
//     if (err.code === "ER_CON_COUNT_ERROR") {
//       console.error("Database has too many connections.");
//     }
//     if (err.code === "ECONNREFUSED") {
//       console.error("Database connection was refused.");
//     }
//     return err;
//   }
//   if (connection) connection.release();
//   return;
// });

// Promisify for Node.js async/await.
// pool.query = util.promisify(pool.query);

// module.exports = pool;




pool = mysql.createPool(params);

// Ping database to check for common exception errors.
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed.");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Database has too many connections.");
    }
    if (err.code === "ECONNREFUSED") {
      console.error("Database connection was refused.");
    }
    return err;
  }
  if (connection) connection.release();
  return;
});

// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query);

module.exports = pool;