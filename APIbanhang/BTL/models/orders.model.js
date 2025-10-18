const db = require("../common/db");
const Orders = (orders) => {
  this.order_id = orders.order_id;
  this.customer_id = orders.customer_id;
  this.order_date = orders.order_date;
  this.total = orders.total;
  this.status = orders.status;
  this.shipping_address = orders.shipping_address;
};
Orders.getById = (order_id, callback) => {
  const sqlString = "SELECT * FROM orders WHERE order_id = ? ";
  db.query(sqlString, [order_id], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
};
Orders.getAll = (callback) => {
  const sqlString = "SELECT * FROM orders ";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(result);
  });
};
Orders.insert = (orders, callBack) => {
  const sqlString = "INSERT INTO orders SET ?";
  db.query(sqlString, [orders], (err, res) => {
    if (err) {
      return callBack(err);
    }
    callBack(null, { order_id: res.insertId, ...orders });
  });
};
Orders.update = (orders, order_id, callBack) => {
  const sqlString = "UPDATE orders SET ? WHERE order_id = ?";
  db.query(sqlString, [orders, order_id], (err, res) => {
    if (err) {
      return callBack(err, null);
    }
    callBack(null, "Cập nhật orders order_id = " + "order_id" + " thành công");
  });
};
Orders.delete = (order_id, callBack) => {
  db.query("DELETE FROM orders WHERE order_id = ?", [order_id], (err, res) => {
    if (err) {
      return callBack(err);
    }
    callBack("Xóa orders order_id = " + "order_id" + " thành công");
  });
};
Orders.getOrders = (callback) => {
  db.query("CALL GetOrders()", (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results[0]); // chỉ trả dữ liệu về Controller
  });
};
Orders.getOrdersByCustomerAndStatus = (customerId, status, page, pageSize, callback) => {
  const sql = "CALL GetCustomerOrdersByStatus(?, ?, ?, ?)";
  const params = [customerId, status || null, page, pageSize];

  db.query(sql, params, (err, results) => {
    if (err) return callback(err);

    const rows = results[0]; // SELECT trong procedure trả về ở results[0]
    const ordersMap = {};
    rows.forEach(row => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          id: row.order_id,
          date: row.order_date,
          status: row.status,
          total: row.total,
          items: [],
        };
      }
      ordersMap[row.order_id].items.push({
        id: row.variant_id,
        name: row.product_name,
        image: row.variant_image || row.product_image,
        color: row.color,
        size: row.size,
        price: row.price,
        quantity: row.quantity,
      });
    });

    callback(null, Object.values(ordersMap));
  });
};
Orders.cancelOrder= (orderId, callback) => {
  db.query(
    `CALL cancel_order(?)`,
    [orderId],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result.affectedRows);
    }
  );
};
Orders.trackOrderSimple = (orderId, callback) => {
 db.query(`CALL get_order_detail_full(?)`, [orderId], (err, result) => {
    if (err) return callback(err);

    const rows = result[0];
    if (!rows.length) return callback(null, null);

    const orderInfo = {
      order_id: rows[0].order_id,
      status: rows[0].status,
      order_date: rows[0].order_date,
      total: rows[0].total,
      shipping_address: rows[0].shipping_address,
      last_update: rows[0].last_update,
      items: rows.map(r => ({
        variant_id: r.variant_id,
        product_id: r.product_id,
        name: r.product_name,
        color: r.color,
        size: r.size,
        image: r.variant_image || r.image,
        quantity: r.quantity,
        price: r.order_price
      }))
    };

    callback(null, orderInfo);
  });
};
Orders.trackOrderFull = (orderId, callback) => {
  const sql = `
    SELECT o.order_id, o.status AS current_status, o.order_date,
           t.status AS tracking_status, t.note, t.updated_at
    FROM orders o
    LEFT JOIN order_tracking t ON o.order_id = t.order_id
    WHERE o.order_id = ?
    ORDER BY t.updated_at ASC;
  `;

  db.query(sql, [orderId], (err, rows) => {
    if (err) return callback(err);
    if (!rows.length) return callback(null, null);

    const orderInfo = {
      order_id: rows[0].order_id,
      current_status: rows[0].current_status,
      order_date: rows[0].order_date,
      tracking_history: rows.map(r => ({
        status: r.tracking_status,
        note: r.note,
        updated_at: r.updated_at
      }))
    };

    callback(null, orderInfo);
  });
};
Orders.returnOrder= (orderId, callback) => {
  db.query(
    `CALL return_order(?)`,
    [orderId],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result.affectedRows);
    }
  );
};
Orders.updateStatus = (orderId, newStatus, note, callback) => {
  db.query(`CALL update_order_status(?, ?, ?)`, [orderId, newStatus, note], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};
Orders.getCountByMonth = (callback) => {
  const sql = `
    SELECT COUNT(*) AS count
    FROM orders o
    JOIN payment p ON o.order_id = p.order_id
    WHERE o.status = 'đã giao'
      AND p.status = 'đã thanh toán'
      AND MONTH(o.order_date) = MONTH(CURRENT_DATE())
      AND YEAR(o.order_date) = YEAR(CURRENT_DATE());
  `;
  db.query(sql, (err, res) => {
    if (err) return callback(err);
    callback(null, res[0].count || 0);
  });
};
Orders.getCountByMonthALL = (callback) => {
  const sql = `
    SELECT COUNT(*) AS count
    FROM orders
    WHERE MONTH(order_date) = MONTH(CURRENT_DATE())
      AND YEAR(order_date) = YEAR(CURRENT_DATE())
  `;
  db.query(sql, (err, res) => {
    if (err) return callback(err);
    callback(null, res[0].count || 0);
  });
};
Orders.getRevenueByMonth = (callback) => {
  const sql = `
    SELECT 
    SUM(oi.price * oi.quantity) AS total
    FROM orders o
    JOIN order_item oi ON o.order_id = oi.order_id
    JOIN payment p ON o.order_id = p.order_id
    WHERE o.status = 'đã giao'
      AND p.status = 'đã thanh toán'
      AND MONTH(o.order_date) = MONTH(CURRENT_DATE())
      AND YEAR(o.order_date) = YEAR(CURRENT_DATE());
  `;
  db.query(sql, (err, res) => {
    if (err) return callback(err);
    callback(null, res[0].total || 0);
  });
};
Orders.getChartData = (filterType, startDate, endDate, callBack) => {
  let query = `
    SELECT 
      DATE_FORMAT(o.order_date, '%d/%m') AS label,
      SUM(oi.price * oi.quantity) AS total
    FROM orders o
    JOIN order_item oi ON o.order_id = oi.order_id
    JOIN payment p ON o.order_id = p.order_id
    WHERE LOWER(o.status) = 'đã giao'
      AND LOWER(p.status) = 'đã thanh toán'
  `;
  const params = [];

  // ⚡ Nếu có startDate & endDate thì ưu tiên lọc theo khoảng thời gian này
  if (startDate && endDate) {
    query += ` AND o.order_date BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  } 
  else {
    // 🔹 Nếu không có startDate & endDate thì mới dùng filterType
    switch (filterType) {
      case 'tuan':
        query += ` AND o.order_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND CURDATE()`;
        break;
      case 'thang':
        query += ` AND MONTH(o.order_date) = MONTH(CURDATE()) AND YEAR(o.order_date) = YEAR(CURDATE())`;
        break;
      case 'quy':
        query += ` AND QUARTER(o.order_date) = QUARTER(CURDATE()) AND YEAR(o.order_date) = YEAR(CURDATE())`;
        break;
      case 'nam':
        query += ` AND YEAR(o.order_date) = YEAR(CURDATE())`;
        break;
      default:
        query += ` AND MONTH(o.order_date) = MONTH(CURDATE()) AND YEAR(o.order_date) = YEAR(CURDATE())`;
    }
  }

  query += `
    GROUP BY DATE_FORMAT(o.order_date, '%d/%m')
    ORDER BY MIN(o.order_date)
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('❌ Lỗi truy vấn doanh thu:', err);
      return callBack(null, { labels: [], datasets: [{ label: 'Doanh thu (VNĐ)', data: [] }] });
    }

    if (!results || results.length === 0) {
      return callBack(null, { labels: [], datasets: [{ label: 'Doanh thu (VNĐ)', data: [] }] });
    }

    const labels = results.map(r => r.label);
    const data = results.map(r => Number(r.total || 0));

    callBack(null, {
      labels,
      datasets: [
        {
          label: 'Doanh thu (VNĐ)',
          backgroundColor: '#6f42c1',
          data,
        },
      ],
    });
  });
};

module.exports = Orders;
