const sql = require("mssql/msnodesqlv8");
const ShortUniqueId = require("short-unique-id");
const { connectDB } = require("../utils/connect");

async function findById(id) {
  let pool = await connectDB;

  return pool
    .request()
    .input("id_user", sql.VarChar(10), id)
    .query(`select * from tbl_admin where id_user = @id_user`);
}

async function insert(document) {
  let pool = await connectDB;

  return pool.request().query();
}

module.exports = {
  findById,
  insert,
};
