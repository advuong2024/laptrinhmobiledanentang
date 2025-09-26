const db = require("../common/db");
const Cart_item = (cart_item) => {
  this.cart_item_id = cart_item.cart_item_id;
  this.cart_id = cart_item.cart_id;
  this.variant_id = cart_item.variant_id;
  this.quantity = cart_item.quantity;
};
Cart_item.getById = (cart_item_id, callback) => {
  const sqlString = "SELECT * FROM cart_item WHERE cart_item_id = ? ";
  db.query(sqlString, [cart_item_id], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
};
Cart_item.getAll = (callback) => {
  const sqlString = "SELECT * FROM cart_item ";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
};
Cart_item.insert = (cart_item, callBack) => {
  const sqlString = "INSERT INTO cart_item SET ?";
  db.query(sqlString, [cart_item], (err, res) => {
    if (err) {
      callBack(err);
      return;
    }
    callBack({cart_item_id : res.insertId, ...cart_item });
  });
};
Cart_item.update = (cart_item, cart_item_id, callBack) => {
  const sqlString = "UPDATE cart_item SET ? WHERE cart_item_id = ?";
  db.query(sqlString, [cart_item, cart_item_id], (err, res) => {
    if (err) {
      callBack(err);
      return;
    }
    callBack("Cập nhật cart_item cart_item_id = " + cart_item_id + " thành công");
  });
};
Cart_item.delete = (cart_item_id, callBack) => {
  db.query("DELETE FROM cart_item WHERE cart_item_id = ?", [cart_item_id], (err, res) => {
    if (err) {
      callBack(err);
      return;
    }
    if (res.affectedRows === 0) return callBack(new Error("Không tìm thấy item để xóa"), null);
    callBack(null, { message: `Xóa cart_item_id = ${cart_item_id} thành công` });
  });
};
module.exports = Cart_item;
