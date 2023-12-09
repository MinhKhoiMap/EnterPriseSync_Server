const sql = require("mssql/msnodesqlv8");

class OrderModel {
  total_price = 0;
  constructor(
    id_order,
    status_order,
    order_date,
    done_date = null,
    customer_name,
    customer_address,
    customer_phone,
    channel_platform,
    id_enterprise
  ) {
    this.id_order = id_order;
    this.status_order = status_order;
    this.order_date = order_date;
    this.done_date = done_date;
    this.customer_name = customer_name;
    this.customer_address = customer_address;
    this.customer_phone = customer_phone;
    this.channel_platform = channel_platform;
    this.id_enterprise = id_enterprise;
  }

  addOrderDetails(orderDetail) {
    this.orderDetail.push(orderDetail);
  }

  findAll(pool) {
    return pool
      .request()
      .input("id_enterprise", sql.VarChar(10), this.id_enterprise)
      .query(`select * from tbl_order where id_enterprise = @id_enterprise`);
  }

  findById(pool) {
    return pool
      .request()
      .input("id_order", sql.VarChar(10), this.id_order)
      .input("id_enterprise", sql.VarChar(10), this.id_enterprise)
      .query(`select tbl_order.*, tbl.id_product, tbl.product_name, tbl.quantity, tbl.price, tbl.platform from tbl_order 
              join 
                (select tbl_order_details.id_order,tbl_product.id_product, tbl_product.product_name, tbl_product.price,
                  tbl_product.platform, tbl_order_details.quantity from tbl_order_details 
                  join 
                    tbl_product 
                  on tbl_order_details.id_product = tbl_product.id_product) as tbl
              on tbl_order.id_order = tbl.id_order
              where tbl.id_order = @id_order
                    and tbl_order.id_enterprise = @id_enterprise`);
  }

  insert(pool) {
    if (this.status_order === "P" && this.done_date != null)
      throw [new Error("Invalid status order"), new Error(400)];

    return pool
      .request()
      .input("id_order", sql.VarChar(10), this.id_order)
      .input("status_order", sql.Char(1), this.status_order)
      .input("order_date", sql.Date, this.order_date)
      .input("done_date", sql.Date, this.done_date)
      .input("customer_name", sql.NVarChar(200), this.customer_name)
      .input("customer_address", sql.NVarChar(250), this.customer_address)
      .input("customer_phone", sql.VarChar(11), this.customer_phone)
      .input("channel_platform", sql.VarChar(20), this.channel_platform)
      .input("id_enterprise", sql.VarChar(10), this.id_enterprise)
      .input("total_price", sql.Int, this.total_price)
      .query(
        `insert into tbl_order 
            (id_order, status_order, order_date, done_date, customer_name, 
              customer_address, customer_phone, channel_platform, id_enterprise, total_price) 
            values 
            (@id_order, @status_order, @order_date, @done_date, @customer_name, 
              @customer_address, @customer_phone, @channel_platform, @id_enterprise, @total_price)`
      );
  }

  updateStatus(pool, newStatus) {
    return pool
      .request()
      .input("new_status", sql.Char(1), newStatus)
      .input("id_order", sql.VarChar(10), this.id_order)
      .query(`update tbl_order set status_order = @new_status, done_date = GETDATE()
                where id_order = @id_order`);
  }

  updateTotalPrice(pool, total_price) {
    this.total_price = total_price;
    return pool
      .request()
      .input("total_price", sql.Int, total_price)
      .input("id_order", sql.VarChar(10), this.id_order)
      .query(`update tbl_order set total_price = @total_price
                where id_order = @id_order`);
  }
}

module.exports = OrderModel;
