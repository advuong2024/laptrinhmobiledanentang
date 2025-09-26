const db = require("../common/db");
const Orders = (orders) => {
  this.order_id = orders.order_id;
  this.customer_id = orders.customer_id;
  this.order_date = orders.order_date;
  this.total = orders.total;
  this.status = orders.status;
  this.shipping_address = orders.shipping_address;
};
Orders.getById = (order_id, callback) => {
  const sqlString = "SELECT * FROM orders WHERE order_id = ? ";
  db.query(sqlString, [order_id], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
};
Orders.getAll = (callback) => {
  const sqlString = "SELECT * FROM orders ";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
};
Orders.insert = (orders, callBack) => {
  const sqlString = "INSERT INTO orders SET ?";
  db.query(sqlString, [orders], (err, res) => {
    if (err) {
      return callBack(err);
    }
    callBack(null, { order_id: res.insertId, ...orders });
  });
};
Orders.update = (orders, order_id, callBack) => {
  const sqlString = "UPDATE orders SET ? WHERE order_id = ?";
  db.query(sqlString, [orders, order_id], (err, res) => {
    if (err) {
      return callBack(err);
    }
    callBack("Cập nhật orders order_id = " + "order_id" + " thành công");
  });
};
Orders.delete = (order_id, callBack) => {
  db.query("DELETE FROM orders WHERE order_id = ?", [order_id], (err, res) => {
    if (err) {
      return callBack(err);
    }
    callBack("Xóa orders order_id = " + "order_id" + " thành công");
  });
};
Orders.getOrders = (callback) => {
  db.query("CALL GetOrders()", (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results[0]); // chỉ trả dữ liệu về Controller
  });
};

module.exports = Orders;
