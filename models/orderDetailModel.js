const sql = require("mssql/msnodesqlv8");

function insert(pool, detail) {
  return pool
    .request()
    .input("id_order_detail", sql.VarChar(10), detail.id_detail)
    .input("quantity", sql.Int(10), detail.quantity)
    .input("id_product", sql.VarChar(10), detail.id_product)
    .input("id_order", sql.VarChar(10), detail.id_order)
    .query(
      `insert into tbl_order_details (id_order_detail, quantity, id_product, id_order)
        values (@id_order_detail, @quantity, @id_product, @id_order)`
    );
}

module.exports = {
  insert,
};
