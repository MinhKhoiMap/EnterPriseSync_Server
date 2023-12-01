const userModel = require("../models/accountModel");

async function checkUsernameExisted(username) {
  const listUsers = await userModel.findByUsername(username);
    console.log(listUsers, "listUser");
  if (listUsers.recordset.length > 0) {
    return true;
  }
  return false;
}

module.exports = checkUsernameExisted;
