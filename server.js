const http = require("http");
const { connectDB, sql } = require("./utils/connect");
const {
  getAllUser,
  getUserById,
  createUser,
  updateUserField,
} = require("./controller/accountController");

const server = http.createServer((req, res) => {
  if (req.url === "/api/users") {
    switch (req.method) {
      case "GET":
        getAllUser(req, res);
        break;
      case "POST":
        createUser(req, res);
        break;
      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
  } else if (req.url.match(/\/api\/users\/([a-zA-Z0-9]+)/)) {
    switch (req.method) {
      case "GET":
        getUserById(req, res);
        break;
      case "PUT":
        updateUserField(req, res);
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
