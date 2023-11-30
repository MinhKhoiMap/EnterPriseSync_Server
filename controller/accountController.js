const userModel = require("../models/accountModel");
const { getBodyData } = require("../utils/getBodyData");
const checkUsernameExisted = require("../middlewares/checkUsernameExisted");
const passwordStrengthChecker = require("../utils/checkStrengthPassword");
const checkAuth = require("../middlewares/checkAuthentication");

// @desc    Gets All User
// @route   GET /api/users
async function getAllUser(req, res) {
  const authInfo = checkAuth(req, res);
  
  try {
    const users = await userModel.findAll();

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
  const id = req.url.split("/")[3];
  try {
    const user = await userModel.findById(id);

    if (user) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data: user.recordset }));
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
      const documentInserted = await userModel.insert(document);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data: documentInserted }));
    } else {
      throw [new Error("Account already exists"), new Error(400)];
    }
  } catch (error) {
    console.log(error, "loi r");
    res.writeHead(error[1]?.message || 500, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: error[0].message }));
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

      const respone = await userModel.updateField(id, field, body[field]);
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

module.exports = {
  getAllUser,
  getUserById,
  createUser,
  updateUserField,
};
