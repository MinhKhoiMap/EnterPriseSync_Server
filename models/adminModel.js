const sql = require("mssql/msnodesqlv8");
const ShortUniqueId = require("short-unique-id");

const uid = new ShortUniqueId({ length: 10 });

class AdminModel {
  constructor(admin_name, id_user) {
    this.admin_name = admin_name;
    this.id_user = id_user;
  }

  findById(pool) {
    return pool
      .request()
      .input("id_user", sql.VarChar(10), this.id_user)
      .query(`select * from tbl_admin where id_user = @id_user`);
  }

  insert(pool) {
    if (this.id_user && this.admin_name) {
      return pool
        .request()
        .input("id_user", sql.VarChar(10), this.id_user)
        .input("id_admin", sql.VarChar(10), uid.rnd())
        .input("admin_name", sql.NVarChar(200), this.admin_name)
        .query(
          `insert into tbl_admin (id_user, id_admin, admin_name) values (@id_user, @id_admin, @admin_name)`
        );
    } else {
      throw [new Error("Invalid document user profile"), new Error(400)];
    }
  }

  deleteDocument(pool) {
    return pool
      .request()
      .input("id_user", sql.VarChar(10), this.id_user)
      .query(`delete from tbl_admin where id_user = @id_user`);
  }
}

module.exports = AdminModel;
