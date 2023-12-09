const sql = require("mssql/msnodesqlv8");
const jwt = require("jsonwebtoken");
const ShortUniqueId = require("short-unique-id");

const { getBodyData } = require("../utils/getBodyData");
const { connectDB } = require("../utils/connect");

const accountModel = require("../models/accountModel");
const enterpriseModel = require("../models/enterpriseModel");
const OrderModel = require("../models/orderModel");
const orderDetailModel = require("../models/orderDetailModel");
const productModel = require("../models/productModel");

const uid = new ShortUniqueId({ length: 10 });

// @desc    Get All Order
// @route   GET /api/orders
async function getAllOrder(req, res) {
  if (req.user.role !== "EN")
    throw [
      new Error("You don't have permission to access this action"),
      new Error(401),
    ];
  let pool = await connectDB;
  // console.log(new Date().toLocaleDateString());

  try {
    let orderObj = new OrderModel();
    orderObj.id_enterprise = req.user.id_user;
    const response = await orderObj.findAll(pool);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        data: response.recordset,
      })
    );
  } catch (error) {
    console.log(error, "loi r");
    res.writeHead(error[1]?.message || 500, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: error[0]?.message || error.message }));
  }
}

// @desc    Get Detail Order
// @route   GET /api/orders/:id
async function getDetailOrder(req, res) {
  if (req.user.role !== "EN")
    throw [
      new Error("You don't have permission to access this action"),
      new Error(401),
    ];

  let id = req.url.split("/")[3];
  let pool = await connectDB;

  try {
    let orderObj = new OrderModel();
    orderObj.id_enterprise = req.user.id_user;
    orderObj.id_order = id;
    const response = await orderObj.findById(pool);

    let data = response.recordset;
    console.log(data);

    const result = {};
    result.products = [];

    for (let i = 0; i < data.length; i++) {
      let productDetail = {
        id_product: data[0].id_product,
        product_name: data[0].product_name,
        quantity: data[0].quantity,
        price: data[0].price,
        platform: data[0].platform,
      };

      for (let key in data[i]) {
        if (key in productDetail) {
          productDetail[key] = data[i][key];
        } else {
          result[key] = data[i][key];
        }
      }
      result.products.push(productDetail);
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        data: result,
      })
    );
  } catch (error) {
    console.log(error, "loi r");
    res.writeHead(error[1]?.message || 500, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: error[0]?.message || error.message }));
  }
}

// @desc    Create Order
// @route   POST /api/orders
async function createOrder(req, res) {
  let pool = await connectDB;

  try {
    let body = JSON.parse(await getBodyData(req));

    const transaction = new sql.Transaction(pool);

    // let order = {
    //   status_order: body.status_order,
    //   order_date: body.order_date,
    //   done_date: body?.done_date || null,
    //   customer_name: body.customer_name,
    //   customer_address: body.customer_address,
    //   customer_phone: body.customer_phone,
    //   channel_platform: body.channel_platform,
    //   id_enterprise: req.user.id_user,
    // };

    let orderObj = new OrderModel(
      (id_order = uid.rnd()),
      (status_order = body.status_order),
      (order_date = body.order_date),
      null,
      (customer_name = body.customer_name),
      (customer_address = body.customer_address),
      (customer_phone = body.customer_phone),
      (channel_platform = body.channel_platform),
      (id_enterprise = req.user.id_user)
    );

    await transaction.begin();
    let total_price = 0;

    await orderObj.insert(transaction);

    for (let i = 0; i < body.products.length; i++) {
      try {
        let itemProduct = {
          id_detail: uid.rnd(),
          quantity: body.products[i].quantity,
          id_product: body.products[i].id_product,
          id_order: orderObj.id_order,
        };

        const productResponse = await productModel.findByIdAndSelectField(
          pool,
          itemProduct.id_product,
          "price"
        );

        let productInfo = productResponse.recordset[0];
        total_price += productInfo.price * itemProduct.quantity;

        await orderDetailModel.insert(transaction, itemProduct);
      } catch (error) {
        await transaction.rollback();
        throw [new Error(error), new Error(400)];
      }
    }

    await orderObj.updateTotalPrice(transaction, total_price);

    await transaction.commit();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Add order successfully" }));
  } catch (error) {
    console.log(error, "loi r");
    res.writeHead(error[1]?.message || 500, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: error[0]?.message || error.message }));
  }
}

// @desc    Update Order (Status AND Done Date)
// @route   PUT /api/orders/:id
// async function updateStausOrder(req, res) {
//   let pool = await connectDB;
//   try {
//     let id = req.url.split("/")[3];
//     let body = JSON.parse(await getBodyData(req));

//     await orderModel.updateStatus(pool, body.updateStatus, id);

//     res.writeHead(200, { "Content-Type": "application/json" });
//     res.end(JSON.stringify({ message: "Updated status successfully" }));
//   } catch (error) {
//     console.log(error, "loi r");
//     res.writeHead(error[1]?.message || 500, {
//       "Content-Type": "application/json",
//     });
//     res.end(JSON.stringify({ message: error[0]?.message || error.message }));
//   }
// }

module.exports = {
  getAllOrder,
  getDetailOrder,
  createOrder,
  // updateStatusOrder,
};
