const jwt = require("jsonwebtoken");

const accountModel = require("../models/accountModel");
const enterpriseModel = require("../models/enterpriseModel");
const adminModel = require("../models/adminModel");
const roleModel = require("../models/roleModel");

const { getBodyData } = require("../utils/getBodyData");
const checkUsernameExisted = require("../middlewares/checkUsernameExisted");
const passwordStrengthChecker = require("../utils/checkStrengthPassword");
const checkAuth = require("../middlewares/checkAuthentication");

// @desc    Gets All User
// @route   GET /api/users
async function getAllUser(req, res) {
  const authInfo = checkAuth(req, res);

  // console.log(authInfo)

  try {
    const users = await accountModel.findAll();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: users.recordset }));
  } catch (error) {
    console.log(error, "loi r");
    res.writeHead(error[1]?.message || 500, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: error[0]?.message || error.message }));
  }
}

// @desc    Get User By Id
// @route   GET /api/users/:id
async function getUserById(req, res) {
  const url = new URL(`${process.env.SERVER_DOMAIN}${req.url}`);
  const id = url.pathname.split("/")[3];

  try {
    const responseRole = await roleModel.findById(req.user.role);
    const role = responseRole.recordset[0].tbl_integrate;
    const responseUser = await accountModel.findUserInfoById(id, role);
    let user = responseUser.recordset[0];

    console.log(responseUser, responseUser.recordset[0].id_user);

    if (user) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data: user }));
    } else {
      // res.writeHead(404, { "Content-Type": "application/json" });
      // res.end(JSON.stringify({ message: "User not found" }));
      throw [new Error("User not found"), new Error(404)];
    }
  } catch (error) {
    console.log(error, "loi r");
    res.writeHead(error[1]?.message || 500, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: error[0].message }));
  }
}

async function handleLogin(req, res) {
  let body = await getBodyData(req);
  const { username, password } = JSON.parse(body);

  try {
    const responseAccount = await accountModel.findByUsername(username);
    const account = responseAccount.recordset[0];
    console.log(account, responseAccount);
    if (username === account.username && password === account.password) {
      const userToken = jwt.sign(
        { id_user: account.id_user, role: account.role },
        process.env.SECRET_KEY_TOKEN
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ userToken }));
    } else {
      throw [new Error("Username or Password wrong"), new Error(401)];
    }
  } catch (error) {
    console.log(error, "loi r");
    res.writeHead(error[1]?.message || 500, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: error[0].message }));
  }
}

// @desc    Create User (ADMIN OR ENTERPRISE OWNER)
// @route   POST /api/users
async function createUser(req, res) {
  try {
    let body = await getBodyData(req);
    let { username, password, role } = JSON.parse(body);

    let document = {
      username,
      password,
      role,
    };

    const isExisted = await checkUsernameExisted(username);

    if (!isExisted) {
      // await enterpriseModel.create({ hh: "hh" }, role);
      const documentInserted = await accountModel.insert(document);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data: document }));
    } else {
      throw [new Error("Account already exists"), new Error(400)];
    }
  } catch (error) {
    console.log(error, "loi r");
    res.writeHead(error[1]?.message || 500, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: error[0]?.message || error.message }));
  }
}

// @desc    Update User
// @route   PUT /api/users/:id
async function updateUserField(req, res) {
  try {
    let id = req.url.split("/")[3];
    let body = JSON.parse(await getBodyData(req));

    if (!(Object.keys(body).length > 1)) {
      const field = Object.keys(body)[0].toLowerCase().trim();

      if (field === "password" && !passwordStrengthChecker(body[field].trim()))
        throw new Error("Password is not enough strength");

      const respone = await accountModel.updateField(id, field, body[field]);
      console.log(respone);
      if (respone.rowsAffected[0] > 0) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Update Password Successfully" }));
      } else {
        throw [new Error("User not found"), new Error(404)];
      }
    }
  } catch (error) {
    console.log(error, "loi r");
    res.writeHead(error[1]?.message || 500, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: error[0].message }));
  }
}

async function deleteUser(req, res) {
  try {
    let id = req.url.split("/")[3];
    const response = await accountModel.deleteDocument(id);
    console.log(response);

    if (response.rowsAffected[0] > 0) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data: response }));
    } else {
      throw [new Error("User not found"), new Error(404)];
    }
  } catch (error) {
    console.log(error, "loi r");
    res.writeHead(error[1]?.message || 500, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: error[0].message }));
  }
}

module.exports = {
  getAllUser,
  getUserById,
  handleLogin,
  createUser,
  updateUserField,
  deleteUser,
};
