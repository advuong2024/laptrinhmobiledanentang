const db = require("../common/db");
const Product_details = (product_details) => {
  this.detail_id = product_details.detail_id;
  this.product_id = product_details.product_id;
  this.detail_key = product_details.detail_key;
  this.detail_value = product_details.detail_value;
};
Product_details.getById = (detail_id, callback) => {
  const sqlString = "SELECT * FROM product_details WHERE detail_id = ? ";
  db.query(sqlString, [detail_id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};
Product_details.getAll = (callback) => {
  const sqlString = "SELECT * FROM product_details ";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};
Product_details.insert = (product_details, callBack) => {
  const sqlString = "INSERT INTO product_details SET ?";
  db.query(sqlString, [product_details], (err, res) => {
    if (err) {
      callBack(err, null);
      return;
    }
    callBack(null, {detail_id : res.insertId, ...product_details });
  });
};
Product_details.update = (product_details, detail_id, callBack) => {
  const sqlString = "UPDATE product_details SET ? WHERE detail_id = ?";
  db.query(sqlString, [product_details, detail_id], (err, res) => {
    if (err) {
      callBack(err, null);
      return;
    }
    callBack(null, "Cập nhật product_details detail_id = " + "detail_id" + " thành công");
  });
};
Product_details.delete = (detail_id, callBack) => {
  db.query("DELETE FROM product_details WHERE detail_id = ?", [detail_id], (err, res) => {
    if (err) {
      callBack(err, null);
      return;
    }
    callBack(null, "Xóa product_details detail_id = " + "detail_id" + " thành công");
  });
};
Product_details.GetByIDProduct = (product_id, callback) => {
  const sqlString = "SELECT * FROM product_details WHERE product_id =?";
  db.query(sqlString, [product_id], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
}
module.exports = Product_details;
