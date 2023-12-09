const sql = require("mssql/msnodesqlv8");

class RoleModel {
  constructor(id_role, explain, tbl_integrate) {
    this.id_role = id_role;
    this.explain = explain;
    this.tbl_integrate = tbl_integrate;
  }

  findById(pool) {
    return pool
      .request()
      .input("role", sql.VarChar(10), this.id_role)
      .query(`select tbl_integrate from tbl_role where id_role = @role`);
  }

  insert(pool) {
    return pool
      .request()
      .input("id_role", sql.VarChar(10), this.id_role)
      .input("explain", sql.NVarChar(100), this.explain)
      .input("integrate", sql.VarChar(100), this.tbl_integrate)
      .query(
        `insert into tbl_role (id_role, explain, tbl_integrate) values (@id_role, @explain, @integrate)`
      );
  }
}

module.exports = RoleModel;
