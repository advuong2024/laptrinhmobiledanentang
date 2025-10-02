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
      callBack(err, null);
      return;
    }
    callBack(null, { 
      success: true, 
      message: `Cập nhật customer_id = ${customer_id} thành công`,
      affectedRows: res.affectedRows 
    });
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
Customer.getStats = (customer_id, callBack) => {
  const sqlString = `
    SELECT 
        c.customer_id,
        c.fullname,
        COALESCE(SUM(p.amount), 0) AS tong_chi_tieu,
        COUNT(DISTINCT o.order_id) AS tong_don_hang,
        CASE 
            WHEN COALESCE(SUM(p.amount), 0) >= 20000000 THEN 'Kim Cương'
            WHEN COALESCE(SUM(p.amount), 0) >= 10000000 THEN 'Vàng'
            WHEN COALESCE(SUM(p.amount), 0) >= 5000000 THEN 'Bạc'
            ELSE 'Thành viên'
        END AS hang_thanh_vien
    FROM customer c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
    LEFT JOIN payment p ON o.order_id = p.order_id AND p.status = 'đã thanh toán'
    WHERE c.customer_id = ?
    GROUP BY c.customer_id, c.fullname
  `;
  db.query(sqlString, [customer_id], (err, res) => {
    if (err) {
      callBack(err, null);
      return;
    }
    callBack(null, res[0]);
  });
};
Customer.updateAvatar = (customer_id, avatarPath, callback) => {
  const sql = "UPDATE customer SET avatar = ? WHERE customer_id = ?";
  db.query(sql, [avatarPath, customer_id], callback);
};
module.exports = Customer;
