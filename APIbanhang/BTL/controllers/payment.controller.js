const Payment = require("../models/payment.model");
module.exports = {
  getAll: (req, res) => {
    Payment.getAll((result) => {
      res.send(result);
    });
  },
  getById: (req, res) => {
    const id = req.params.id;
    Payment.getById(id, (result) => {
      res.send(result);
    });
  },
  insert: (req, res) => {
    const payment = req.body;
    Payment.insert(payment, (result) => {
      res.send(result);
    });
  },
  update: (req, res) => {
    const payment = req.body;
    const id = req.params.id;
    Payment.update(payment, id, (result) => {
      res.send(result);
    });
  },
  delete: (req, res) => {
    const id = req.params.id;
    Payment.delete(id, (result) => {
      res.send(result);
    });
  },
  getPaymentByOrderId: (req, res) => {
    const orderId = req.params.id;

    Payment.getByOrderId(orderId, (err, data) => {
      if (err) {
        console.error("Lỗi khi lấy payment:", err);
        return res.status(500).json({ message: "Lỗi server khi lấy thanh toán" });
      }

      if (!data) {
        return res.status(404).json({ message: "Không tìm thấy thanh toán cho đơn hàng này" });
      }

      res.json(data);
    });
  },
};
