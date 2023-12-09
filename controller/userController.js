const sql = require("mssql/msnodesqlv8");
const jwt = require("jsonwebtoken");
const ShortUniqueId = require("short-unique-id");

const { connectDB } = require("../utils/connect");

const AccountModel = require("../models/accountModel");
const EnterpriseModel = require("../models/enterpriseModel");
const AdminModel = require("../models/adminModel");
const RoleModel = require("../models/roleModel");

const { getBodyData } = require("../utils/getBodyData");
const checkUsernameExisted = require("../middlewares/checkUsernameExisted");
const passwordStrengthChecker = require("../utils/checkStrengthPassword");

const uid = new ShortUniqueId({ length: 10 });

// @desc    Gets All User
// @route   GET /api/users
// Use for testing
async function getAllUser(req, res) {
  if (req.user && req.user.role !== "AD") {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ message: "You are not allowed to access this action" })
    );
  }

  let pool = await connectDB;

  try {
    let accountObj = new AccountModel();
    const users = await accountObj.findAll(pool);

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
  // console.log(req.user, "request dot user");
  const url = new URL(`${process.env.SERVER_DOMAIN}${req.url}`);
  const id = url.pathname.split("/")[3];

  let pool = await connectDB;

  try {
    let roleObj = new RoleModel(req.user.role);

    const responseRole = await roleObj.findById(pool);

    roleObj.tbl_integrate = responseRole.recordset[0].tbl_integrate;

    let accountObj = new AccountModel();

    accountObj.tbl = roleObj.tbl_integrate;
    accountObj.id_user = id;
    const responseUser = await accountObj.findUserInfoById(pool);
    let user = responseUser.recordset[0];

    if (user) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data: user }));
    } else {
      throw [new Error("User not found"), new Error(404)];
    }
  } catch (error) {
    console.log(error, "loi r");
    res.writeHead(error[1]?.message || 500, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: error[0]?.message || error }));
  }
}

// @desc    Login
// @route   POST /api/login
async function handleLogin(req, res) {
  let body = await getBodyData(req);
  const { username, password } = JSON.parse(body);

  let pool = await connectDB;

  try {
    let accountObj = new AccountModel();
    accountObj.username = username;

    const responseAccount = await accountObj.findByUsername(pool);
    const account = responseAccount.recordset[0];

    if (username === account?.username && password === account?.password) {
      const userToken = jwt.sign(
        { id_user: account.id_user, role: account.role },
        process.env.SECRET_KEY_TOKEN
      );

      let roleObj = new RoleModel(account.role);

      accountObj.id_user = account.id_user;

      const responseRole = await roleObj.findById(pool);
      roleObj.tbl_integrate = responseRole.recordset[0].tbl_integrate;
      accountObj.tbl = roleObj.tbl_integrate;
      const responseUser = await accountObj.findUserInfoById(pool);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data: responseUser.recordset[0], userToken }));
    } else {
      throw [new Error("Username or Password wrong"), new Error(401)];
    }
  } catch (error) {
    console.log(error, "loi r");
    res.writeHead(error[1]?.message || 500, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: error[0]?.message || error.message }));
  }
}

// @desc    Create User (ADMIN OR ENTERPRISE OWNER)
// @route   POST /api/users
async function createUser(req, res) {
  let pool = await connectDB;

  try {
    let body = await getBodyData(req);
    let bodyData = JSON.parse(body);

    let accountObj = new AccountModel(
      bodyData.username,
      bodyData.password.trim(),
      bodyData.role,
      uid.rnd()
    );

    const isExisted = await checkUsernameExisted(accountObj.username);

    if (!isExisted) {
      if (!passwordStrengthChecker(accountObj.password))
        throw new Error("Password is not enough strength");

      const transaction = new sql.Transaction(pool);

      await transaction.begin();
      await accountObj.insert(transaction);
      try {
        switch (bodyData.role) {
          case "AD":
            let adminObj = new AdminModel(
              bodyData.admin_name,
              accountObj.id_user
            );
            await adminObj.insert(transaction);
            accountObj.detailInfo = adminObj;
            break;
          case "EN":
            let enterpriseObj = new EnterpriseModel(
              accountObj.id_user,
              bodyData.enterprise_name
            );
            await enterpriseObj.insert(transaction);
            accountObj.detailInfo = enterpriseObj;
            break;
          default:
            throw [new Error("Invalid Role"), new Error(400)];
        }
      } catch (error) {
        await transaction.rollback();
        throw [new Error(error), new Error(400)];
      }

      await transaction.commit();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data: accountObj }));
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

// @desc    Update User (Username Or Password)
// @route   PUT /api/users/:id
async function updateUserField(req, res) {
  let pool = await connectDB;

  try {
    let id = req.url.split("/")[3];
    let body = JSON.parse(await getBodyData(req));

    if (!(Object.keys(body).length > 1)) {
      const field = Object.keys(body)[0].toLowerCase().trim();

      if (field === "password" && !passwordStrengthChecker(body[field].trim()))
        throw new Error("Password is not enough strength");

      let accountObj = new AccountModel();
      // accountObj.id_user =
      const respone = await accountObj.updateField(
        pool,
        id,
        field,
        body[field]
      );

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

// @desc    Delete User
// @route   DELETE /api/users
async function deleteUser(req, res) {
  let pool = await connectDB;

  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  console.log(req.user);

  try {
    switch (req.user.role) {
      case "AD":
        let adminObj = new AdminModel("", req.user.id_user);
        await adminObj.deleteDocument(transaction);
        break;
      case "EN":
        let enterpriseObj = new EnterpriseModel(req.user.id_user);
        await enterpriseObj.deleteDocument(transaction);
        break;
      default:
        throw [new Error("Invalid Role", new Error(400))];
    }

    let accountObj = new AccountModel("", "", "", req.user.id_user);
    const response = await accountObj.deleteDocument(transaction);

    console.log(response);

    if (response.rowsAffected[0] < 1) {
      throw [new Error("User not found"), new Error(404)];
    }

    transaction.commit();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Delete successfully" }));
  } catch (error) {
    console.log(error, "loi r");
    await transaction.rollback();
    res.writeHead(error[1]?.message || 500, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ message: error[0]?.message || error.message }));
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
