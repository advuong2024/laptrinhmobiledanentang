const bcrypt = require('bcrypt');
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
      return callBack(err, null);
    }
    return callBack(null, {user_id : res.insertId, ...user_account });
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
};
User_account.changePassword = (userId, oldPassword, newPassword, callback) => {
  db.query("SELECT password FROM user_account WHERE user_id = ?", [userId], (err, result) => {
    if (err) return callback(err, null);
    if (result.length === 0) return callback("User không tồn tại", null);

    const currentPassword = result[0].password;

    // So sánh trực tiếp
    if (oldPassword.trim() !== currentPassword.trim()) {
      return callback("Mật khẩu cũ không đúng", null);
    }
    // Cập nhật mật khẩu mới
    db.query("UPDATE user_account SET password = ? WHERE user_id = ?", [newPassword, userId], (err2) => {
      if (err2) return callback(err2, null);
      callback(null, "Đổi mật khẩu thành công");
    });
  });
};
module.exports = User_account;
