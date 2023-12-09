const sql = require("mssql/msnodesqlv8");

function findAll(pool) {
  return pool.request().query(`select * from tbl_product`);
}

function findByIdAndSelectField(pool, id_product, field) {
  return pool
    .request()
    .input("id_product", sql.VarChar(10), id_product)
    .query(
      `select ${field || "*"} from tbl_product where id_product = @id_product`
    );
}

function findByNameAndPlatform(pool, product_name, platform) {
  return pool.request().query(
    `select * from tbl_product where product_name like N'${product_name}%'
      and platform like N'${platform}%'`
  );
}

function insert(pool, product) {
  return pool
    .request()
    .input("id_product", sql.VarChar(10), product.id_product)
    .input("product_name", sql.NVarChar(500), product.product_name)
    .input("platform", sql.NVarChar(200), product.platform)
    .input("price", sql.Int, product.price)
    .query(
      `insert into tbl_product (id_product, product_name, platform, price)
        values (@id_product, @product_name, @platform, @price)`
    );
}

module.exports = {
  findAll,
  findByIdAndSelectField,
  findByNameAndPlatform,
  insert,
};
