const sql = require("mssql/msnodesqlv8");
const ShortUniqueId = require("short-unique-id");
const { connectDB } = require("../utils/connect");

const uid = new ShortUniqueId({ length: 10 });

async function findAll() {
  let pool = await connectDB;
  return pool.request().query("select * from tbl_user");
}

async function findById(id) {
  let pool = await connectDB;
  return pool.request().query(`select * from tbl_user where id_user = '${id}'`);
}

async function findByUsername(username) {
  let pool = await connectDB;
  return pool
    .request()
    .query(`select username from tbl_user where username = '${username}'`);
}

async function insert(document) {
  let pool = await connectDB;

  if (document.username && document.password && document.role) {
    return pool
      .request()
      .input("id_user", sql.VarChar(10), uid.rnd())
      .input("username", sql.VarChar(100), document.username)
      .input("password", sql.VarChar(100), document.password)
      .input("role", sql.VarChar(10), document.role)
      .query(
        `insert into tbl_user (id_user, username, password, role) values(@id_user, @username, @password, @role)`
      );
  } else {
    throw new Error("Invalid document user profile");
  }
}

async function updateField(id, field, updateValue) {
  let pool = await connectDB;

  return pool
    .request()
    .input("id_user", sql.VarChar(10), id)
    .input("value", sql.VarChar, updateValue)
    .query(`update tbl_user set ${field} = @value where id_user = @id_user`);
}

module.exports = {
  findAll,
  findById,
  findByUsername,
  insert,
  updateField,
};
