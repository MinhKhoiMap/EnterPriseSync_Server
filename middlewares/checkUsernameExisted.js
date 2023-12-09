const { connectDB } = require("../utils/connect");

const AccountModel = require("../models/accountModel");

async function checkUsernameExisted(username) {
  let pool = await connectDB;

  let accountObj = new AccountModel(username);

  const listUsers = await accountObj.findByUsername(pool);

  if (listUsers.recordset.length > 0) {
    return true;
  }
  return false;
}

module.exports = checkUsernameExisted;
