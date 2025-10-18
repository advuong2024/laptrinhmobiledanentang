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
  getOrdersItem: (req, res) => {
    const { customer_id, status, page = 1, pageSize = 10 } = req.query;

    Orders.getOrdersByCustomerAndStatus(
      customer_id,
      status,
      parseInt(page),
      parseInt(pageSize),
      (err, orders) => {
        if (err) {
          console.error("Lỗi khi lấy orders:", err); // log ra console
          return res.status(500).json({ message: err.message || "Lỗi server" });
        }
        res.json(orders);
      }
    );
  },
  cancelOrder: (req, res) => {
    const { orderId } = req.params;
    Orders.cancelOrder(orderId, (err, affectedRows) => {
      if (err) return res.status(500).json({ message: "Lỗi server" });
      if (affectedRows === 0) return res.status(400).json({ message: "Không thể hủy đơn" });
      res.json({ message: "Đã hủy đơn hàng" });
    });
  },
  getOrderDetail: (req, res) => {
    const orderId = req.params.id;

    Orders.trackOrderSimple(orderId, (err, result) => {
      if (err) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
        return res.status(500).send({ message: "Lỗi máy chủ khi lấy chi tiết đơn hàng." });
      }

      if (!result) {
        return res.status(404).send({ message: "Không tìm thấy đơn hàng." });
      }

      res.status(200).send({
        message: "Lấy chi tiết đơn hàng thành công.",
        data: result
      });
    });
  },
  getOrderTracking: (req, res) => {
    const orderId = req.params.id;

    Orders.trackOrderFull(orderId, (err, result) => {
      if (err) {
        console.error("Lỗi khi lấy lịch sử đơn hàng:", err);
        return res.status(500).send({ message: "Lỗi máy chủ khi lấy lịch sử đơn hàng." });
      }

      if (!result) {
        return res.status(404).send({ message: "Không tìm thấy lịch sử cho đơn hàng này." });
      }

      res.status(200).send({
        message: "Lấy lịch sử đơn hàng thành công.",
        data: result
      });
    });
  },
  updateOrderStatus: (req, res) => {
    const orderId = req.params.id;
    const { newStatus, note } = req.body;

    if (!newStatus) {
      return res.status(400).send({ message: "Thiếu trạng thái mới (newStatus)." });
    }

    Orders.updateStatus(orderId, newStatus, note || "", (err, result) => {
      if (err) {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
        return res.status(500).send({ message: "Lỗi khi cập nhật trạng thái đơn hàng." });
      }

      res.status(200).send({
        message: "Cập nhật trạng thái đơn hàng thành công.",
        data: result
      });
    });
  },
  returnOrder: (req, res) => {
    const { orderId } = req.params;
    Orders.returnOrder(orderId, (err, affectedRows) => {
      if (err) return res.status(500).json({ message: "Lỗi server" });
      if (affectedRows === 0) return res.status(400).json({ message: "Không thể trả hàng" });
      res.json({ message: "Đơn hàng đã được đánh dấu trả hàng" });
    });
  },
  getCountByMonth: (req, res) => {
    Orders.getCountByMonth((err, count) => {
      if (err) {
        console.error('❌ Lỗi khi lấy số lượng đơn hàng:', err);
        return res.status(500).json({ message: 'Lỗi server khi lấy số lượng đơn hàng.' });
      }
      res.status(200).json({ total_completed_orders: count });
    });
  },
  getCountByMonthALL: (req, res) => {
    Orders.getCountByMonthALL((err, count) => {
      if (err) {
        console.error('❌ Lỗi khi lấy tổng số lượng đơn hàng:', err);
        return res.status(500).json({ message: 'Lỗi server khi lấy tổng số lượng đơn hàng.' });
      }
      res.status(200).json({ total_orders: count });
    });
  },
  getRevenueByMonth: (req, res) => {
    Orders.getRevenueByMonth((err, total) => {
      if (err) {
        console.error('❌ Lỗi khi lấy doanh thu:', err);
        return res.status(500).json({ message: 'Lỗi server khi lấy doanh thu.' });
      }
      res.status(200).json({ total_revenue: total });
    });
  },
  getChartData: (req, res) => {
    const { filter, startDate, endDate } = req.query;

    Orders.getChartData(filter, startDate, endDate, (err, data) => {
      if (err) {
        console.error('❌ Lỗi khi lấy dữ liệu biểu đồ:', err);
        return res.status(500).json({ message: 'Lỗi khi lấy dữ liệu biểu đồ' });
      }

      res.json(data);
    });
  },
};
