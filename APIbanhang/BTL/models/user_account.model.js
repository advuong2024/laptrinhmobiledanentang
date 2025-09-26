const { taikhoan } = require("../../../../CongngheWeb/Apicode/BTL/models/bacsi.model");
const db = require("../common/db");
const User_account = (user_account) => {
  this.user_id = user_account.user_id;
  this.username = user_account.username;
  this.password = user_account.password;
  this.role = user_account.role;
  this.customer_id = user_account.customer_id;
};
User_account.getById = (user_id, callback) => {
  const sqlString = "SELECT * FROM user_account WHERE user_id = ? ";
  db.query(sqlString, [user_id], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
};
User_account.getAll = (callback) => {
  const sqlString = "SELECT * FROM user_account ";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
};
User_account.insert = (user_account, callBack) => {
  const sqlString = "INSERT INTO user_account SET ?";
  db.query(sqlString, [user_account], (err, res) => {
    if (err) {
      callBack(err);
      return;
    }
    callBack({user_id : res.insertId, ...user_account });
  });
};
User_account.update = (user_account, user_id, callBack) => {
  const sqlString = "UPDATE user_account SET ? WHERE user_id = ?";
  db.query(sqlString, [user_account, user_id], (err, res) => {
    if (err) {
      callBack(err);
      return;
    }
    callBack("Cập nhật user_account user_id = " + user_id + " thành công");
  });
};
User_account.delete = (user_id, callBack) => {
  db.query("DELETE FROM user_account WHERE user_id = ?", [user_id], (err, res) => {
    if (err) {
      callBack(err, null);
      return;
    }
    callBack(null, "Xóa user_account user_id = " + user_id + " thành công");
  });
};
User_account.findByAccount = (taikhoan, callBack) => {
  db.query("select * from user_account where username = ?", [taikhoan], (err, res) =>
  {
    if (err) {
      callBack(err, null);
      return;
    }
    if (res.length) {
      callBack(null, res[0]);
    } else {
      callBack(null, null);
    }
  });
}
module.exports = User_account;
