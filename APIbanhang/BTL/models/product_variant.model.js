const db = require("../common/db");
const Product_variant = (product_variant) => {
  this.variant_id = product_variant.variant_id;
  this.product_id = product_variant.product_id;
  this.color = product_variant.color;
  this.size = product_variant.size;
  this.stock = product_variant.stock;
};
Product_variant.getById = (variant_id, callback) => {
  const sqlString = "SELECT * FROM product_variant WHERE variant_id = ? ";
  db.query(sqlString, [variant_id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};
Product_variant.getAll = (callback) => {
  const sqlString = "SELECT * FROM product_variant ";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};
Product_variant.insert = (product_variant, callBack) => {
  const sqlString = "INSERT INTO product_variant SET ?";
  db.query(sqlString, [product_variant], (err, res) => {
    if (err) {
      return callBack(err, null);
    }
    callBack(null, {variant_id : res.insertId, ...product_variant });
  });
};
Product_variant.update = (product_variant, variant_id, callBack) => {
  const sqlString = "UPDATE product_variant SET ? WHERE variant_id = ?";
  db.query(sqlString, [product_variant, variant_id], (err, res) => {
    if (err) {
      return callBack(err, null);
    }
    callBack(null, "Cập nhật product_variant variant_id = " + variant_id + " thành công");
  });
};
Product_variant.delete = (variant_id, callBack) => {
  db.query("DELETE FROM product_variant WHERE variant_id = ?", [variant_id], (err, res) => {
    if (err) {
      return callBack(err, null);
    }
    callBack(null, "Xóa product_variant variant_id = " + variant_id + " thành công");
  });
};
Product_variant.GetByIDProduct = (product_id, callback) => {
  const sqlString = "SELECT * FROM product_variant WHERE product_id =?";
  db.query(sqlString, [product_id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};
Product_variant.GetByIDVariant = (variant_id, callback) => {
  const sqlString = `
    SELECT p.product_name, p.price, pv.variant_id, pv.color, pv.size, pv.image, pv.stock 
    FROM product_variant pv 
    JOIN product p ON p.product_id = pv.product_id 
    WHERE variant_id =?`;
  db.query(sqlString, [variant_id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};
Product_variant.updateStock = (product_id, size, stock, color, callback) => {
    const sql = `
        UPDATE product_variant 
        SET stock = ? 
        WHERE product_id = ? AND size = ? AND color = ?
    `;
    db.query(sql, [stock, product_id, size, color], (err, res) => {
        if (err) return callback(err, null);
        callback(null, "Cập nhật stock thành công");
    });
};
Product_variant.GetStock = (product_id, size, color, callback) => {
  const sql = "SELECT stock FROM product_variant WHERE product_id = ? AND size = ? AND color = ?";
  db.query(sql, [product_id, size, color], (err, res) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, res);
  });
};
module.exports = Product_variant;
