const db = require("../common/db");
const Order_item = (order_item) => {
  this.order_item_id = order_item.order_item_id;
  this.order_id = order_item.order_id;
  this.variant_id = order_item.variant_id;
  this.quantity = order_item.quantity;
  this.price = order_item.price;
};
Order_item.getById = (order_item_id, callback) => {
  const sqlString = "SELECT * FROM order_item WHERE order_item_id = ? ";
  db.query(sqlString, [order_item_id], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
};
Order_item.getAll = (callback) => {
  const sqlString = "SELECT * FROM order_item ";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
};
Order_item.insert = (order_item, callBack) => {
  const sqlString = "INSERT INTO order_item SET ?";
  db.query(sqlString, [order_item], (err, res) => {
    if (err) {
      return callBack(err);
    }
    callBack(null, { order_item_id: res.insertId, ...order_item });
  });
};
Order_item.update = (order_item, order_item_id, callBack) => {
  const sqlString = "UPDATE order_item SET ? WHERE order_item_id = ?";
  db.query(sqlString, [order_item, order_item_id], (err, res) => {
    if (err) {
      return callBack(err);
    }
    callBack("Cập nhật order_item order_item_id = " + "order_item_id" + " thành công");
  });
};
Order_item.delete = (order_item_id, callBack) => {
  db.query("DELETE FROM order_item WHERE order_item_id = ?", [order_item_id], (err, res) => {
    if (err) {
      return callBack(err);
    }
    callBack("Xóa order_item order_item_id = " + "order_item_id" + " thành công");
  });
};
Order_item.getByOrderId = (order_id, callback) => {
  const sql = `
    SELECT 
      oi.order_item_id,
      oi.order_id,
      oi.variant_id,
      pv.color,
      pv.size,
      pv.image AS variant_image,
      p.product_id,
      p.product_name,
      p.image AS product_image,
      oi.quantity,
      oi.price
    FROM order_item oi
    JOIN product_variant pv ON oi.variant_id = pv.variant_id
    JOIN product p ON pv.product_id = p.product_id
    WHERE oi.order_id = ?;
  `;
  db.query(sql, [order_id], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
};
module.exports = Order_item;
