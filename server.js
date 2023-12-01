const http = require("http");
const accountController = require("./controller/accountController");

const checkAuthentication = require("./middlewares/checkAuthentication");

const server = http.createServer((req, res) => {
  if (req.url === "/api/users") {
    switch (req.method) {
      case "GET":
        accountController.getAllUser(req, res);
        break;
      case "POST":
        accountController.createUser(req, res);
        break;
      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
  } else if (req.url.match(/\/api\/users\/([a-zA-Z0-9]+)/)) {
    switch (req.method) {
      case "GET":
        checkAuthentication(req, res);
        accountController.getUserById(req, res);
        break;
      case "PUT":
        accountController.updateUserField(req, res);
        break;
      case "DELETE":
        accountController.deleteUser(req, res);
        break;
      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
  } else if (req.url === "/api/login" && req.method === "POST") {
    accountController.handleLogin(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  }
});

module.exports = server;
