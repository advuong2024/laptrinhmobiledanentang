const db = require("../common/db");
const Category = (category) => {
  this.category_id = category.category_id;
  this.category_name = category.category_name;
};
Category.getById = (category_id, callback) => {
  const sqlString = "SELECT * FROM category WHERE category_id = ? ";
  db.query(sqlString, [category_id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};
Category.getAll = (callback) => {
  const sqlString = "SELECT * FROM category ";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};
Category.insert = (category, callBack) => {
  const sqlString = "INSERT INTO category SET ?";
  db.query(sqlString, [category], (err, res) => {
    if (err) {
      callBack(err, null);
      return;
    }
    callBack(null, {category_id : res.insertId, ...category });
  });
};
Category.update = (category, category_id, callBack) => {
  const sqlString = "UPDATE category SET ? WHERE category_id = ?";
  db.query(sqlString, [category, category_id], (err, res) => {
    if (err) {
      callBack(err, null);
      return;
    }
    callBack(null, "Cập nhật category category_id = " + category_id + " thành công");
  });
};
Category.delete = (category_id, callBack) => {
  db.query("DELETE FROM category WHERE category_id = ?", [category_id], (err, res) => {
    if (err) {
      callBack(err, null);
      return;
    }
    callBack(null, "Xóa category category_id = " + category_id + " thành công");
  });
};
Category.GetByCategoryID = (category_id, callback) => {
  const sqlString = `
    SELECT p.product_id, p.product_name, p.description, p.price, p.image, c.category_name
    FROM product p
    JOIN category c ON p.category_id = c.category_id
    WHERE p.category_id = ?`;
  db.query(sqlString, [category_id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
}
module.exports = Category;