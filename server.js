const http = require("http");
const accountController = require("./controller/userController");
const orderController = require("./controller/orderController");
const productController = require("./controller/productController");

const checkAuth = require("./middlewares/checkAuthentication");
const passCors = require("./utils/cors");

const server = http.createServer((req, res) => {
  passCors(res);
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET, PUT, DELETE",
  };

  if (req.method === "OPTIONS") {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  if (req.url === "/api/users") {
    switch (req.method) {
      case "GET":
        req.user = checkAuth(req, res);
        accountController.getAllUser(req, res);
        break;
      case "POST":
        accountController.createUser(req, res);
        break;
      case "DELETE":
        req.user = checkAuth(req, res);
        accountController.deleteUser(req, res);
        break;
      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
  } else if (req.url.match(/\/api\/users\/([a-zA-Z0-9]+)/)) {
    switch (req.method) {
      case "GET":
        req.user = checkAuth(req, res);
        accountController.getUserById(req, res);
        break;
      case "PUT":
        req.user = checkAuth(req, res);
        accountController.updateUserField(req, res);
        break;
      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
  } else if (req.url === "/api/login" && req.method === "POST") {
    accountController.handleLogin(req, res);
  } else if (req.url === "/api/orders") {
    switch (req.method) {
      case "POST":
        req.user = checkAuth(req, res);
        orderController.createOrder(req, res);
        break;
      default:
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
  } else if (
    req.url.match(
      /\/api\/orders\?([\w-]+(=[\w.\-:%+]*)?(&[\w-]+(=[\w.\-:%+]*)?)*)?$/
    ) &&
    req.method === "GET"
  ) {
    req.user = checkAuth(req, res);
    orderController.getAllOrder(req, res);
  } else if (req.url.match(/\/api\/orders\/([a-zA-Z0-9]+)/)) {
    switch (req.method) {
      case "GET":
        req.user = checkAuth(req);
        orderController.getDetailOrder(req, res);
        break;
      case "PUT":
        req.user = checkAuth(req);
        orderController.updateStausOrder(req, res);
      default:
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
  } else if (req.url === "/api/products") {
    switch (req.method) {
      case "GET":
        productController.getAllProducts(req, res);
        break;
      case "POST":
        productController.createProduct(req, res);
        break;
      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
  } else if (
    req.url.match(
      /\/api\/products\?([\w-]+(=[\w.\-:%+]*)?(&[\w-]+(=[\w.\-:%+]*)?)*)?$/
    )
  ) {
    switch (req.method) {
      case "GET":
        productController.searchProduct(req, res);
        break;
      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  }
});

module.exports = server;
