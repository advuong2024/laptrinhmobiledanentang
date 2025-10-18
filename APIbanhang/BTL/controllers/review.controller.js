const Review = require("../models/review.model");

module.exports = {
  // Lấy toàn bộ review
  getAll: (req, res) => {
    Review.getAll((err, result) => {
      if (err) {
        console.error("Lỗi lấy dữ liệu:", err);
        return res.status(500).json({ success: false, message: "Lỗi khi lấy dữ liệu review" });
      }
      res.status(200).json({ success: true, data: result });
    });
  },

  // Lấy review theo ID
  getById: (req, res) => {
    const id = req.params.id;
    Review.getById(id, (err, result) => {
      if (err) {
        console.error("Lỗi khi lấy review:", err);
        return res.status(500).json({ success: false, message: "Lỗi khi lấy review" });
      }
      res.status(200).json({ success: true, data: result });
    });
  },

  // ✅ Thêm review
  insert: (req, res) => {
    const review = req.body;

    if (!review.product_id || !review.customer_id || !review.rating) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
    }

    Review.insert(review, (err, result) => {
      if (err) {
        console.error("Lỗi thêm review:", err);
        return res.status(500).json({ success: false, message: "Lỗi khi thêm review" });
      }
      // ✅ Trả JSON hợp lệ để tránh lỗi Parse ở frontend
      res.status(200).json({
        success: true,
        message: "Thêm đánh giá thành công",
        data: result
      });
    });
  },

  // Cập nhật review
  update: (req, res) => {
    const id = req.params.id;
    const review = req.body;

    Review.update(review, id, (err, result) => {
      if (err) {
        console.error("Lỗi cập nhật review:", err);
        return res.status(500).json({ success: false, message: "Lỗi khi cập nhật review" });
      }
      res.status(200).json({ success: true, message: result });
    });
  },

  // Xóa review
  delete: (req, res) => {
    const id = req.params.id;
    Review.delete(id, (err, result) => {
      if (err) {
        console.error("Lỗi xóa review:", err);
        return res.status(500).json({ success: false, message: "Lỗi khi xóa review" });
      }
      res.status(200).json({ success: true, message: result });
    });
  },

  // Lấy danh sách review theo sản phẩm
  GetByProduct: (req, res) => {
    const id = req.params.id;
    Review.GetByProduct(id, (err, result) => {
      if (err) {
        console.error("Lỗi lấy review theo sản phẩm:", err);
        return res.status(500).json({ success: false, message: err.message });
      }
      res.status(200).json({ success: true, data: result });
    });
  },

  // Lấy thống kê review (trung bình & tổng)
  GetReviewStats: (req, res) => {
    const id = req.params.id;
    Review.GetReviewStats(id, (err, result) => {
      if (err) {
        console.error("Lỗi thống kê review:", err);
        return res.status(500).json({ success: false, message: err.message });
      }
      res.status(200).json({ success: true, data: result });
    });
  },
  checkReviewedByOrder: (req, res) => {
    const { order_id, product_id, customer_id } = req.params;

    Review.hasReviewedByOrder(order_id, product_id, customer_id, (err, reviewed) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.status(200).json({ success: true, hasReviewed: reviewed });
    });
  },
};
