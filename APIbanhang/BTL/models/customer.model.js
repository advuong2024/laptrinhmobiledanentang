const db = require("../common/db");
const Customer = (customer) => {
  this.customer_id = customer.customer_id;
  this.fullname = customer.fullname;
  this.phone = customer.phone;
  this.email = customer.email;
  this.address = customer.address;
  this.gender = customer.gender;
  this.avatar = customer.avatar;
};
Customer.getById = (customer_id, callback) => {
  const sqlString = "SELECT * FROM customer WHERE customer_id = ? ";
  db.query(sqlString, [customer_id], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
};
Customer.getAll = (callback) => {
  const sqlString = "SELECT * FROM customer ";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
};
Customer.insert = (customer, callBack) => {
  const sqlString = "INSERT INTO customer SET ?";
  db.query(sqlString, [customer], (err, res) => {
    if (err) {
      callBack(err);
      return;
    }
    callBack({customer_id : res.insertId, ...customer });
  });
};
Customer.update = (customer, customer_id, callBack) => {
  const sqlString = "UPDATE customer SET ? WHERE customer_id = ?";
  db.query(sqlString, [customer, customer_id], (err, res) => {
    if (err) {
      callBack(err);
      return;
    }
    callBack("Cập nhật customer customer_id = " + "customer_id" + " thành công");
  });
};
Customer.delete = (customer_id, callBack) => {
  db.query("DELETE FROM customer WHERE customer_id = ?", [customer_id], (err, res) => {
    if (err) {
      callBack(err);
      return;
    }
    callBack("Xóa customer customer_id = " + "customer_id" + " thành công");
  });
};
module.exports = Customer;
