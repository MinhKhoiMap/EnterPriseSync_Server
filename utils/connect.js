const sql = require("mssql/msnodesqlv8");

// config info to connect database
var config = {
  server: "KHOIMAPMAP\\MINKOITHOCHIEN",
  user: "sa",
  password: "1234",
  database: "EnterpriseSync",
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
