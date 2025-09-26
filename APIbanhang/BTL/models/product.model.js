const db = require("../common/db");
const Product = (product) => {
  this.product_id = product.product_id;
  this.product_name = product.product_name;
  this.description = product.description;
  this.price = product.price;
  this.image = product.image;
  this.category_id = product.category_id;
};
Product.getById = (product_id, callback) => {
  const sqlString = "SELECT * FROM product WHERE product_id = ? ";
  db.query(sqlString, [product_id], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
};
Product.getAll = (callback) => {
  const sqlString = "SELECT * FROM product ";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
};
Product.insert = (product, callBack) => {
  const sqlString = "INSERT INTO product SET ?";
  db.query(sqlString, [product], (err, res) => {
    if (err) {
      callBack(err);
      return;
    }
    callBack({product_id : res.insertId, ...product });
  });
};
Product.update = (product, product_id, callBack) => {
  const sqlString = "UPDATE product SET ? WHERE product_id = ?";
  db.query(sqlString, [product, product_id], (err, res) => {
    if (err) {
      callBack(err);
      return;
    }
    callBack("Cập nhật product product_id = " + "product_id" + " thành công");
  });
};
Product.delete = (product_id, callBack) => {
  db.query("DELETE FROM product WHERE product_id = ?", [product_id], (err, res) => {
    if (err) {
      callBack(err);
      return;
    }
    callBack("Xóa product product_id = " + "product_id" + " thành công");
  });
};
// Product.GetByCategoryID = (category_id, callback) => {
//   const sqlString =`
//     SELECT p.product_id, p.product_name, p.description, p.price, p.image, c.category_name
//     FROM product p
//     JOIN category c ON p.category_id = c.category_id
//     WHERE p.category_id = ?`;
//   db.query(sqlString, [category_id], (err, result) => {
//     if (err) {
//       return callback(err, null);
//     }
//     callback(null, result);
//   });
// };
module.exports = Product;
