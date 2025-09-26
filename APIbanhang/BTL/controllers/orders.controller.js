const db = require("../common/db");
const Orders = require("../models/orders.model");
const Order_item = require('../models/order_item.model');
const Payment = require('../models/payment.model');
module.exports = {
  getAll: (req, res) => {
    Orders.getAll((result) => {
      res.send(result);
    });
  },
  getById: (req, res) => {
    const id = req.params.id;
    Orders.getById(id, (result) => {
      res.send(result);
    });
  },
  insert: (req, res) => {
    const orders = req.body;
    Orders.insert(orders, (result) => {
      res.send(result);
    });
  },
  update: (req, res) => {
    const orders = req.body;
    const id = req.params.id;
    Orders.update(orders, id, (result) => {
      res.send(result);
    });
  },
  delete: (req, res) => {
    const id = req.params.id;
    Orders.delete(id, (result) => {
      res.send(result);
    });
  },
  getOrders: (req, res) => {
    Orders.getOrders((err, orders) => {
      if (err) {
        console.error("Lỗi:", err);
        return res.status(500).json({ message: "Lỗi server" });
      }
      res.json(orders);
    });
  },
  placeOrder: (req, res) => {
    const { customer_id, shipping_address, items, payment_method } = req.body;
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    Orders.insert({ customer_id, total, shipping_address }, (err, orderResult) => {
      if (err) return res.status(500).json({ message: "Lỗi tạo order", err });

      const order_id = orderResult.order_id;
      let completedItems = 0;

      for (const item of items) {
        Order_item.insert({ order_id, variant_id: item.variant_id, quantity: item.quantity, price: item.price }, (err2) => {
          if (err2) return res.status(500).json({ message: "Lỗi tạo order_item", err: err2 });

          completedItems++;
          if (completedItems === items.length) {
            Payment.insert({ order_id, method: payment_method, amount: total }, (err3) => {
              if (err3) return res.status(500).json({ message: "Lỗi tạo payment", err: err3 });

              res.status(201).json({ message: "Đặt hàng thành công", order_id });
            });
          }
        });
      }
    });
  },
};
