const sql = require("mssql/msnodesqlv8");

// config info to connect database
var config = {
  server: process.env.DB_SERVER_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true,
  },
};

const conn = new sql.ConnectionPool(config);

const connectDB = new sql.ConnectionPool(config, (err) =>
  err ? console.log(err) : console.log("Connect to database successfully")
).connect();

module.exports = { connectDB, conn };
