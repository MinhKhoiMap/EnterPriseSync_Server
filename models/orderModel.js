require("mssql");
const { connectDB } = require("../utils/connect");

async function findAll() {
  let pool = await connectDB;
  return pool.request().query(`select * from tbl_order`);
}
