const sql = require("mssql/msnodesqlv8");
const { connectDB } = require("../utils/connect");

async function findById(id_role) {
  let pool = await connectDB;

  return pool
    .request()
    .input("role", sql.VarChar(10), id_role)
    .query(`select tbl_integrate from tbl_role where id_role = @role`);
}

async function insert(id_role, explain, tbl_integrate) {
  let pool = await connectDB;

  return pool
    .request()
    .input("id_role", sql.VarChar(10), id_role)
    .input("explain", sql.NVarChar(100), explain)
    .input("integrate", sql.VarChar(100), tbl_integrate)
    .query(
      `insert into tbl_role (id_role, explain, tbl_integrate) values (@id_role, @explain, @integrate)`
    );
}

module.exports = {
  findById,
  insert,
};
