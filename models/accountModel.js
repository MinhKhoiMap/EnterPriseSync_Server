const sql = require("mssql/msnodesqlv8");

class AccountModel {
  constructor(username, password, role, id_user, detailInfo, tbl) {
    this.username = username;
    this.password = password;
    this.role = role;
    this.id_user = id_user;
    this.detailInfo = detailInfo;
    this.tbl = tbl;
  }

  findAll(pool) {
    return pool.request().query("select * from tbl_user");
  }

  findById(pool) {
    return pool
      .request()
      .query(`select * from tbl_user where id_user = '${this.id}'`);
  }

  findByUsername(pool) {
    return pool
      .request()
      .input("username", sql.VarChar(100), this.username)
      .query(`select * from tbl_user where username = @username`);
  }

  findUserInfoById(pool) {
    return pool
      .request()
      .input("id_user", sql.VarChar(10), this.id_user)
      .query(
        `select tbl_${this.tbl}.*, role from 
            tbl_user left join tbl_${this.tbl} on tbl_user.id_user = tbl_${this.tbl}.id_user 
            where tbl_user.id_user = @id_user`
      );
  }

  insert(pool) {
    if (this.id_user && this.username && this.password && this.role) {
      return pool
        .request()
        .input("id_user", sql.VarChar(10), this.id_user)
        .input("username", sql.VarChar(100), this.username)
        .input("password", sql.VarChar(100), this.password)
        .input("role", sql.VarChar(10), this.role)
        .query(
          `insert into tbl_user (id_user, username, password, role) values(@id_user, @username, @password, @role)`
        );
    } else {
      throw [new Error("Invalid document user profile"), new Error(400)];
    }
  }

  updateField(pool, field, updateValue) {
    return pool
      .request()
      .input("id_user", sql.VarChar(10), this.id)
      .input("value", sql.VarChar, updateValue)
      .query(`update tbl_user set ${field} = @value where id_user = @id_user`);
  }

  deleteDocument(pool) {
    return pool
      .request()
      .input("id", sql.VarChar(10), this.id_user)
      .query(`delete from tbl_user where id_user = @id`);
  }
}

module.exports = AccountModel;
