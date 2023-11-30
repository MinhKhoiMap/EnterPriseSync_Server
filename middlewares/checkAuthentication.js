const jwt = require("jsonwebtoken");

// console.log(jwt.sign("haha", process.env.SECRET_KEY_TOKEN));

function checkAuth(req, res) {
  if (req.headers["authorization"]) {
    const token = req.headers["authorization"];

    try {
      const tokenDecode = jwt.verify(token, process.env.SECRET_KEY_TOKEN);
      return tokenDecode;
    } catch (error) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "User is not authorized" }));
    }
  }
}

module.exports = checkAuth;
