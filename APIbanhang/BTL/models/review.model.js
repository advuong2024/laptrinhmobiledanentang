const db = require("../common/db");
const Review = (review) => {
  this.review_id = review.review_id;
  this.product_id = review.product_id;
  this.customer_id = review.customer_id;
  this.rating = review.rating;
  this.comment = review.comment;
  this.created_at = review.created_at;
  this.order_id = review.order_id;
};
Review.getById = (review_id, callback) => {
  const sqlString = "SELECT * FROM review WHERE review_id = ? ";
  db.query(sqlString, [review_id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};
Review.getAll = (callback) => {
  const sqlString = "SELECT * FROM review";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};
Review.insert = (review, callBack) => {
  const sqlString = "INSERT INTO review SET ?";
  db.query(sqlString, [review], (err, res) => {
    if (err) {
      return callBack(err, null);
    }
    callBack(null, {review_id : res.insertId, ...review });
  })
};
Review.update = (review, review_id, callBack) => {
  const sqlString = "UPDATE review SET ? WHERE review_id = ?";
  db.query(sqlString, [review, review_id], (err, res) => {
    if (err) {
      return callBack(err, null);
    }
    callBack(null, "Cập nhật review review_id = " + review_id + " thành công");
  });
};
Review.delete = (review_id, callBack) => {
  db.query("DELETE FROM review WHERE review_id = ?", [review_id], (err, res) => {
    if (err) {
      return callBack(err, null);
    }
    callBack(null, "Xóa review review_id = " + review_id + " thành công");
  });
};
Review.GetByProduct = (product_id, callback) => {
  const sqlString = `
    Select r.product_id, c.fullname, r.rating, r.comment, r.created_at
    from review r 
    join customer c on r.customer_id = c.customer_id
    Where r.product_id = ?`;
  db.query(sqlString, [product_id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};
Review.GetReviewStats = (product_id, callback) =>{
  const sqlString = `
    select count(review_id) as total_review,
    round(ifnull(avg(rating),0),1) as avg_rating
    from review
    where product_id = ?`
  db.query(sqlString, [product_id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
}
Review.hasReviewedByOrder = (order_id, product_id, customer_id, callback) => {
    const sql = `
      SELECT review_id 
      FROM review 
      WHERE order_id = ? AND product_id = ? AND customer_id = ?
    `;
    db.query(sql, [order_id, product_id, customer_id], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result.length > 0);
    });
};
module.exports = Review;
