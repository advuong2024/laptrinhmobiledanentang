const db = require("../common/db");
const Payment = (payment) => {
  this.payment_id = payment.payment_id;
  this.order_id = payment.order_id;
  this.method = payment.method;
  this.amount = payment.amount;
  this.status = payment.status;
  this.payment_date = payment.payment_date;
};
Payment.getById = (payment_id, callback) => {
  const sqlString = "SELECT * FROM payment WHERE payment_id = ? ";
  db.query(sqlString, [payment_id], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
};
Payment.getAll = (callback) => {
  const sqlString = "SELECT * FROM payment ";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
};
Payment.insert = (payment, callBack) => {
  const sqlString = "INSERT INTO payment SET ?";
  db.query(sqlString, [payment], (err, res) => {
    if (err) {
      return callBack(err);
    }
    callBack(null, { payment_id: res.insertId, ...payment });
  });
};
Payment.update = (payment, order_id, callBack) => {
  const sqlString = "UPDATE payment SET ? WHERE order_id = ?";
  db.query(sqlString, [payment, order_id], (err, res) => {
    if (err) {
      return callBack(err);
    }
    callBack("Cập nhật payment order_id = " + order_id + " thành công");
  });
};
Payment.delete = (payment_id, callBack) => {
  db.query("DELETE FROM payment WHERE payment_id = ?", [payment_id], (err, res) => {
    if (err) {
      return callBack(err);
    }
    callBack("Xóa payment payment_id = " + "payment_id" + " thành công");
  });
};
Payment.getByOrderId = (order_id, callback) => {
  const sql = `SELECT * FROM payment WHERE order_id = ?`;
  db.query(sql, [order_id], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results[0]);
  });
};
module.exports = Payment;
