const sql = require("mssql/msnodesqlv8");
const ShortUniqueId = require("short-unique-id");
const { connectDB } = require("../utils/connect");

const uid = new ShortUniqueId({ length: 10 });

async function create(enterpriseName) {
  let pool = await connectDB;

  return pool
    .request()
    .input("id_user", sql.VarChar(10), uid.rnd())
    .input("enterprise_name", sql.NVarChar(200), enterpriseName)
    .query(
      `insert into tbl_enterprise (id_user, enterprise_name) values (@id_user, @enterprise_name)`
    );
}

module.exports = {
  create,
};
