const sql = require("mssql/msnodesqlv8");
const ShortUniqueId = require("short-unique-id");

const { getBodyData } = require("../utils/getBodyData");
const { connectDB } = require("../utils/connect");
const passCors = require("../utils/cors");

const productModel = require("../models/productModel");

const uid = new ShortUniqueId({ length: 10 });

// @desc    Get All Products
// @route   GET /api/products
async function getAllProducts(req, res) {
  let pool = await connectDB;
  try {
    const response = await productModel.findAll(pool);

    passCors(res);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: response.recordset }));
  } catch (error) {
    console.log(error, "loi r");
    res.writeHead(error[1]?.message || 500, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: error[0]?.message || error.message }));
  }
}

// @desc    Searc Products
// @route   GET /api/products?product_name=
async function searchProduct(req, res) {
  let pool = await connectDB;
  
  try {
    let url = new URL(
      `${process.env.SERVER_DOMAIN}:${process.env.PORT || 5000}${req.url}`
    ).searchParams;
    // console.log(req.url, url, url.get("product_name"));

    const response = await productModel.findByNameAndPlatform(
      pool,
      url.get("product_name"),
      url.get("platform")
    );

    passCors(res);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: response.recordset }));
  } catch (error) {
    console.log(error, "loi r");
    res.writeHead(error[1]?.message || 500, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: error[0]?.message || error.message }));
  }
}

// @desc    Create New Product
// @route   POST /api/products
async function createProduct(req, res) {
  let pool = await connectDB;
  try {
    let body = JSON.parse(await getBodyData(req));

    let product = {
      id_product: uid.rnd(),
      product_name: body.product_name,
      price: body.price,
      platform: body.platform,
    };

    await productModel.insert(pool, product);

    passCors(res);
    res.setHeader("Access-Control-Max-Age", 2592000);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: product }));
  } catch (error) {
    console.log(error, "loi r");
    res.writeHead(error[1]?.message || 500, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: error[0]?.message || error.message }));
  }
}

module.exports = {
  getAllProducts,
  searchProduct,
  createProduct,
};
