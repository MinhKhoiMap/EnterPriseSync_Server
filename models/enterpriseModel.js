const sql = require("mssql/msnodesqlv8");
const AccountModel = require("./accountModel");

class EnterpriseModel {
  constructor(id_user, enterprise_name) {
    this.id_user = id_user;
    this.enterprise_name = enterprise_name;
  }

  findById(pool) {
    return pool
      .request()
      .input("id_user", sql.VarChar(10), this.id_user)
      .query(`select * from tbl_enterprise where id_user = @id_user`);
  }

  insert(pool) {
    if (this.id_user && this.enterprise_name) {
      return pool
        .request()
        .input("id_user", sql.VarChar(10), this.id_user)
        .input("enterprise_name", sql.NVarChar(200), this.enterprise_name)
        .query(
          `insert into tbl_enterprise (id_user, enterprise_name) values (@id_user, @enterprise_name)`
        );
    } else {
      throw [new Error("Invalid Enterprise name"), new Error(400)];
    }
  }

  deleteDocument(pool) {
    return pool
      .request()
      .input("id_user", sql.VarChar(10), this.id_user)
      .query(`delete from tbl_enterprise where id_user = @id_user`);
  }
}

module.exports = EnterpriseModel;
