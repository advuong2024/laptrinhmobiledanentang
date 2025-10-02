const Customer = require("../models/customer.model");
module.exports = {
  getAll: (req, res) => {
    Customer.getAll((result) => {
      res.send(result);
    });
  },
  getById: (req, res) => {
    const id = req.params.id;
    Customer.getById(id, (result) => {
      res.send(result);
    });
  },
  insert: (req, res) => {
    const customer = req.body;
    Customer.insert(customer, (result) => {
      res.send(result);
    });
  },
  update: (req, res) => {
    const customer = req.body;
    const id = req.params.id;

    Customer.update(customer, id, (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Lỗi cập nhật", error: err });
      }
      res.json(result); // ✅ đảm bảo gửi JSON
    });
  },
  delete: (req, res) => {
    const id = req.params.id;
    Customer.delete(id, (result) => {
      res.send(result);
    });
  },
  getCustomerStats: (req, res) => {
    const customer_id = req.params.id;

    Customer.getStats(customer_id, (err, data) => {
      if (err) {
        res.status(500).send({ message: "Lỗi khi lấy thống kê", error: err });
      } else {
        res.send(data);
      }
    });
  },
  changeAvatar: (req, res) => {
    const { id } = req.params;
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ success: false, message: "Thiếu đường dẫn avatar" });
    }
    Customer.updateAvatar(id, avatar, (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi server" });
      return res.json({ message: "Cập nhật avatar thành công", avatar });
    });
  },
};
