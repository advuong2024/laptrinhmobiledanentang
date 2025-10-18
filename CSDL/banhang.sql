-- Tạo database
CREATE DATABASE banhang;
USE banhang;

-- Bảng loại sản phẩm
CREATE TABLE category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    category_image VARCHAR(255)
);

-- Bảng sản phẩm
CREATE TABLE product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);

-- Bảng biến thể sản phẩm (màu sắc + size + tồn kho)
CREATE TABLE product_variant (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    color VARCHAR(50),
    size VARCHAR(20),
    stock INT DEFAULT 0,
    image VARCHAR(255),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);

-- Bảng chi tiết sản phẩm
CREATE TABLE product_details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    detail_key VARCHAR(100) NOT NULL,
    detail_value VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
);

-- Bảng khách hàng (có ảnh đại diện + giới tính)
CREATE TABLE customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    address VARCHAR(255),
    gender ENUM('Nam','Nữ','Khác'),
    avatar VARCHAR(255) -- ảnh đại diện
);

-- Bảng tài khoản (khách hàng & admin)
CREATE TABLE user_account (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- lưu hash khi thực tế
    role ENUM('customer','admin') DEFAULT 'customer',
    customer_id INT NULL,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

-- Bảng giỏ hàng
CREATE TABLE cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);
ALTER TABLE cart 
ADD guest_id VARCHAR(100) NULL;

-- Chi tiết giỏ hàng
CREATE TABLE cart_item (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT,
    variant_id INT,
    quantity INT DEFAULT 1,
    FOREIGN KEY (cart_id) REFERENCES cart(cart_id),
    FOREIGN KEY (variant_id) REFERENCES product_variant(variant_id)
);
ALTER TABLE cart_item
DROP FOREIGN KEY cart_item_ibfk_1;

ALTER TABLE cart_item
ADD CONSTRAINT cart_item_ibfk_1
FOREIGN KEY (cart_id) REFERENCES cart(cart_id)
ON DELETE CASCADE;

-- Bảng đơn hàng
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2),
    status ENUM('đang chờ', 'đã xác nhận', 'đang chuẩn bị', 'đang vận chuyển', 'đã giao', 'đã hủy') DEFAULT 'đang chờ',
    shipping_address VARCHAR(255),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);
ALTER TABLE orders
MODIFY COLUMN order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE orders
MODIFY COLUMN status ENUM('đang chờ', 'đã xác nhận', 'đang vận chuyển', 'đã giao', 'trả hàng', 'đã hủy') DEFAULT 'đang chờ';

CREATE TABLE order_tracking (
    tracking_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    status ENUM('đang chờ', 'đã xác nhận', 'đang vận chuyển', 'đã giao', 'trả hàng', 'đã hủy'),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note VARCHAR(255),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Chi tiết đơn hàng
CREATE TABLE order_item (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    variant_id INT,
    quantity INT,
    price DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variant(variant_id)
);

-- Thanh toán
CREATE TABLE payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    method ENUM('COD','chuyển khoản ngân hàng','ví điện tử') DEFAULT 'COD',
    amount DECIMAL(10,2),
    status ENUM('chưa thanh toán', 'đã thanh toán', 'đã hoàn trả') DEFAULT 'chưa thanh toán',
    payment_date DATETIME,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);
ALTER TABLE payment 
MODIFY COLUMN payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

SHOW CREATE TABLE order_item;
SHOW CREATE TABLE payment;

ALTER TABLE order_item DROP FOREIGN KEY order_item_ibfk_1;
ALTER TABLE payment DROP FOREIGN KEY payment_ibfk_1;

-- Thêm lại foreign key với ON DELETE CASCADE
ALTER TABLE order_item
ADD CONSTRAINT order_item_ibfk_1
FOREIGN KEY (order_id) REFERENCES orders(order_id)
ON DELETE CASCADE;

ALTER TABLE payment
ADD CONSTRAINT payment_ibfk_1
FOREIGN KEY (order_id) REFERENCES orders(order_id)
ON DELETE CASCADE;

-- Đánh giá sản phẩm
CREATE TABLE review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    customer_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES product(product_id),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

INSERT INTO category (category_name, category_image) VALUES
('Áo', 'ao-thun.jpg'),
('Quần', 'quan-jeans.jpg'),
('Giày', 'giay-sneaker.jpg'),
('Phụ kiện', 'phu-kien.jpg');

INSERT INTO product (product_name, description, price, image, category_id) VALUES
('Áo thun trắng basic', 'Áo thun cotton thoáng mát', 150000, 'ao-trang.jpg', 1),
('Áo polo nam', 'Áo polo lịch sự, chất vải co giãn', 200000, 'ao-polo.jpg', 1),
('Áo sơ mi caro', 'Áo sơ mi nam nữ form rộng', 250000, 'so-mi-caro.jpg', 1),
('Quần jeans xanh nam', 'Quần jeans dáng slimfit', 350000, 'jeans-xanh.jpg', 2),
('Quần short kaki', 'Quần short thoải mái cho mùa hè', 180000, 'short-kaki.jpg', 2),
('Quần tây đen', 'Quần âu nam lịch sự công sở', 300000, 'quan-tay.jpg', 2),
('Giày sneaker trắng', 'Sneaker nam nữ phong cách Hàn', 750000, 'sneaker-trang.jpg', 3),
('Giày thể thao chạy bộ', 'Giày thể thao chuyên chạy', 850000, 'giay-chay.jpg', 3),
('Mũ lưỡi trai đen', 'Phụ kiện thời trang cá tính', 100000, 'mu-den.jpg', 4),
('Thắt lưng da nam', 'Thắt lưng da thật cao cấp', 220000, 'that-lung.jpg', 4);

select p.product_id, p.description from product p;

INSERT INTO product_variant (product_id, color, size, stock, image) VALUES
(1, 'Trắng', 'M', 20, 'ao-trang-m.jpg'),
(1, 'Trắng', 'L', 15, 'ao-trang-l.jpg'),
(2, 'Xanh', 'M', 10, 'ao-polo-m.jpg'),
(3, 'Đỏ', 'XL', 12, 'so-mi-caro-xl.jpg'),
(4, 'Xanh đậm', '32', 8, 'jeans-xanh-32.jpg'),
(5, 'Be', 'L', 18, 'short-kaki-l.jpg'),
(6, 'Đen', 'M', 10, 'quan-tay-m.jpg'),
(7, 'Trắng', '42', 5, 'sneaker-trang-42.jpg'),
(8, 'Xanh dương', '41', 6, 'giay-chay-41.jpg'),
(9, 'Đen', 'Free size', 25, 'mu-den.jpg'),
(10, 'Nâu', '110cm', 7, 'that-lung.jpg');

INSERT INTO customer (fullname, phone, email, address, gender, avatar) VALUES
('Nguyễn Văn A', '0901234567', 'a@example.com', 'Hà Nội', 'Nam', 'a.jpg'),
('Trần Thị B', '0912345678', 'b@example.com', 'Hải Phòng', 'Nữ', 'b.jpg'),
('Lê Văn C', '0923456789', 'c@example.com', 'Đà Nẵng', 'Nam', 'c.jpg'),
('Phạm Thị D', '0934567890', 'd@example.com', 'TP.HCM', 'Nữ', 'd.jpg'),
('Hoàng Văn E', '0945678901', 'e@example.com', 'Cần Thơ', 'Khác', 'e.jpg');

INSERT INTO user_account (username, password, role, customer_id) VALUES
('admin', 'admin123', 'admin', NULL),
('user_a', '123456', 'customer', 1),
('user_b', '123456', 'customer', 2),
('user_c', '123456', 'customer', 3),
('user_d', '123456', 'customer', 4);

INSERT INTO review (product_id, customer_id, rating, comment)
VALUES
(1, 1, 5, 'Sản phẩm rất đẹp, đúng mô tả'),
(1, 2, 4, 'Chất lượng ổn, giá hợp lý'),
(1, 3, 5, 'Giao hàng nhanh, đóng gói cẩn thận'),
(1, 4, 3, 'Hơi khác hình nhưng vẫn chấp nhận được'),
(1, 5, 4, 'Dùng khá ổn, sẽ mua tiếp'),

(2, 2, 5, 'Rất ưng ý, sản phẩm tuyệt vời'),
(2, 3, 4, 'Màu sắc đẹp, giống hình'),
(2, 4, 5, 'Đúng size, chất liệu tốt'),
(2, 5, 3, 'Không như mong đợi lắm'),
(2, 1, 4, 'Tạm ổn, phù hợp với giá'),

(3, 3, 5, 'Rất hài lòng, sẽ giới thiệu bạn bè'),
(3, 4, 4, 'Đóng gói tốt, sản phẩm đẹp'),
(3, 5, 5, 'Sản phẩm chuẩn, không có gì để chê'),
(3, 1, 3, 'Chưa thực sự ưng ý'),
(3, 2, 4, 'Ổn áp, dùng khá tốt'),

(4, 4, 5, 'Sản phẩm chất lượng, giá hợp lý'),
(4, 5, 3, 'Khá bình thường, không đặc biệt'),
(4, 1, 4, 'Màu sắc đẹp, giống ảnh'),
(4, 2, 5, 'Rất thích, giao hàng nhanh'),
(4, 3, 4, 'Đúng như shop mô tả'),

(5, 5, 5, 'Quá tuyệt vời, đáng đồng tiền'),
(5, 1, 4, 'Tạm ổn, dùng tốt'),
(5, 2, 5, 'Chất lượng vượt mong đợi'),
(5, 3, 3, 'Cần cải thiện thêm'),
(5, 4, 4, 'Ổn, sẽ mua tiếp'),

(6, 1, 5, 'Hàng đẹp, giống ảnh'),
(6, 2, 4, 'Khá tốt, sẽ giới thiệu'),
(6, 3, 5, 'Rất hài lòng, đáng mua'),
(6, 4, 3, 'Chưa ưng lắm'),
(6, 5, 4, 'Tạm được, chất liệu ổn'),

(7, 2, 5, 'Quá tuyệt, shop uy tín'),
(7, 3, 4, 'Đúng mô tả, giá hợp lý'),
(7, 4, 5, 'Rất thích sản phẩm này'),
(7, 5, 3, 'Chưa thực sự hài lòng'),
(7, 1, 4, 'Ổn, dùng tốt'),

(8, 3, 5, 'Sản phẩm đáng mua'),
(8, 4, 4, 'Màu sắc đẹp, giống hình'),
(8, 5, 5, 'Rất thích, giao nhanh'),
(8, 1, 3, 'Bình thường, không đặc biệt'),
(8, 2, 4, 'Khá ổn, sẽ mua lại'),

(9, 4, 5, 'Sản phẩm chất lượng, rất đẹp'),
(9, 5, 3, 'Hơi thất vọng một chút'),
(9, 1, 4, 'Ổn so với giá'),
(9, 2, 5, 'Rất đáng tiền'),
(9, 3, 4, 'Khá hài lòng'),

(10, 5, 5, 'Quá tuyệt vời, 5 sao'),
(10, 1, 4, 'Ổn áp, dùng tốt'),
(10, 2, 5, 'Rất đẹp, chất lượng tốt'),
(10, 3, 3, 'Không như mong đợi'),
(10, 4, 4, 'Tạm ổn, giao hàng nhanh');

INSERT INTO product_details (product_id, detail_key, detail_value) VALUES
(1, 'Chất liệu', 'Cotton 100% thoáng mát'),
(1, 'Thương hiệu', 'Việt Fashion'),
(1, 'Xuất xứ', 'Việt Nam'),
(1, 'Nơi sản xuất', 'TP. Hồ Chí Minh'),
(1, 'Kiểu dáng', 'Basic, dễ phối đồ'),
(1, 'Hướng dẫn bảo quản', 'Giặt ở nhiệt độ thường, không tẩy mạnh'),
(1, 'Độ bền', '3-5 năm sử dụng bình thường'),
(1, 'Đối tượng phù hợp', 'Sinh viên, nhân viên văn phòng, mặc thường ngày'),

(2, 'Chất liệu', 'Cotton pha spandex co giãn'),
(2, 'Thương hiệu', 'Việt Polo'),
(2, 'Xuất xứ', 'Việt Nam'),
(2, 'Nơi sản xuất', 'Bình Dương'),
(2, 'Kiểu dáng', 'Lịch sự, cổ bẻ'),
(2, 'Hướng dẫn bảo quản', 'Ủi nhiệt độ thấp, giặt máy chế độ nhẹ'),
(2, 'Độ bền', '3 năm sử dụng'),
(2, 'Đối tượng phù hợp', 'Nam giới, đi làm, đi chơi, gặp đối tác'),

(3, 'Chất liệu', 'Vải kate cao cấp'),
(3, 'Thương hiệu', 'Carovn'),
(3, 'Xuất xứ', 'Việt Nam'),
(3, 'Nơi sản xuất', 'Hải Phòng'),
(3, 'Kiểu dáng', 'Form rộng unisex'),
(3, 'Hướng dẫn bảo quản', 'Giặt riêng với đồ trắng, phơi nơi thoáng mát'),
(3, 'Độ bền', '4 năm sử dụng'),
(3, 'Đối tượng phù hợp', 'Nam nữ, học sinh sinh viên, dạo phố'),

(4, 'Chất liệu', 'Denim cao cấp'),
(4, 'Thương hiệu', 'JeanViet'),
(4, 'Xuất xứ', 'Việt Nam'),
(4, 'Nơi sản xuất', 'Đồng Nai'),
(4, 'Kiểu dáng', 'Slimfit tôn dáng'),
(4, 'Hướng dẫn bảo quản', 'Không giặt bằng nước nóng, tránh phơi nắng gắt'),
(4, 'Độ bền', '5-7 năm sử dụng'),
(4, 'Đối tượng phù hợp', 'Nam thanh niên, phong cách trẻ trung'),

(5, 'Chất liệu', 'Kaki thoáng mát'),
(5, 'Thương hiệu', 'KakiViet'),
(5, 'Xuất xứ', 'Việt Nam'),
(5, 'Nơi sản xuất', 'TP. Hồ Chí Minh'),
(5, 'Kiểu dáng', 'Ngắn gối, năng động'),
(5, 'Hướng dẫn bảo quản', 'Giặt máy, ủi ở nhiệt độ trung bình'),
(5, 'Độ bền', '3 năm sử dụng'),
(5, 'Đối tượng phù hợp', 'Nam nữ mùa hè, dạo phố, du lịch'),

(6, 'Chất liệu', 'Vải tuytsi'),
(6, 'Thương hiệu', 'OfficeViet'),
(6, 'Xuất xứ', 'Việt Nam'),
(6, 'Nơi sản xuất', 'Hà Nội'),
(6, 'Kiểu dáng', 'Lịch sự, công sở'),
(6, 'Hướng dẫn bảo quản', 'Ủi nhiệt độ thấp, giặt khô nếu cần'),
(6, 'Độ bền', '5 năm sử dụng'),
(6, 'Đối tượng phù hợp', 'Nhân viên văn phòng, sự kiện trang trọng'),

(7, 'Chất liệu', 'Da PU kết hợp vải canvas'),
(7, 'Thương hiệu', 'Sneaker Việt'),
(7, 'Xuất xứ', 'Việt Nam'),
(7, 'Nơi sản xuất', 'Hà Nội'),
(7, 'Kiểu dáng', 'Trẻ trung, phong cách Hàn Quốc'),
(7, 'Hướng dẫn bảo quản', 'Tránh ngâm nước lâu, vệ sinh bằng khăn ẩm'),
(7, 'Độ bền', '5 năm nếu sử dụng đúng cách'),
(7, 'Đối tượng phù hợp', 'Nam nữ mọi lứa tuổi, đi chơi, đi học, đi làm'),

(8, 'Chất liệu', 'Mesh thoáng khí, đế cao su'),
(8, 'Thương hiệu', 'SportViet'),
(8, 'Xuất xứ', 'Việt Nam'),
(8, 'Nơi sản xuất', 'Đà Nẵng'),
(8, 'Kiểu dáng', 'Thể thao chuyên dụng'),
(8, 'Hướng dẫn bảo quản', 'Không giặt máy, vệ sinh bằng bàn chải mềm'),
(8, 'Độ bền', '4-6 năm sử dụng'),
(8, 'Đối tượng phù hợp', 'Người chạy bộ, tập gym, thể thao ngoài trời'),

(9, 'Chất liệu', 'Vải kaki cao cấp'),
(9, 'Thương hiệu', 'CapVN'),
(9, 'Xuất xứ', 'Việt Nam'),
(9, 'Nơi sản xuất', 'TP. Hồ Chí Minh'),
(9, 'Kiểu dáng', 'Thời trang unisex'),
(9, 'Hướng dẫn bảo quản', 'Không giặt bằng máy, lau sạch bằng khăn ẩm'),
(9, 'Độ bền', '3 năm sử dụng'),
(9, 'Đối tượng phù hợp', 'Nam nữ, dã ngoại, thể thao, dạo phố'),

(10, 'Chất liệu', 'Da bò thật 100%'),
(10, 'Thương hiệu', 'LeatherViet'),
(10, 'Xuất xứ', 'Việt Nam'),
(10, 'Nơi sản xuất', 'Ninh Bình'),
(10, 'Kiểu dáng', 'Lịch lãm, dễ phối đồ'),
(10, 'Hướng dẫn bảo quản', 'Tránh tiếp xúc nước, lau bằng dầu dưỡng da'),
(10, 'Độ bền', '7-10 năm sử dụng'),
(10, 'Đối tượng phù hợp', 'Nam giới, công sở, đi tiệc, dự sự kiện');

SELECT * FROM product_details WHERE product_id = 1;

select * from review;
Select r.product_id, c.fullname, r.rating, r.comment, r.created_at
from review r 
join customer c on r.customer_id = c.customer_id
Where r.product_id = 1;

SELECT 
	COUNT(review_id) AS total_reviews,
	ROUND(IFNULL(AVG(rating), 0), 1) AS avg_rating
FROM review
WHERE product_id = 1;

SELECT p.product_name, p.price, pv.color, pv.size, pv.image, pv.stock
FROM product_variant pv 
JOIN product p ON p.product_id = pv.product_id 
WHERE variant_id =1;

select * from banhang.cart;
select * from banhang.cart_item;
select * from banhang.category;
select * from product;
select * from product_variant;
select * from orders;
select * from order_item;
select * from payment;
select * from user_account;
select * from customer;


DELIMITER $$

CREATE PROCEDURE GetOrders()
BEGIN
    SELECT 
        o.order_id,
        c.fullname AS customer_name,
        c.phone AS customer_phone,
        c.address AS customer_address,
        p.product_name,
        v.color,
        v.size,
        oi.quantity,
        oi.price,
        (oi.quantity * oi.price) AS subtotal,
        o.total AS order_total,
        o.status AS order_status,
        o.order_date
    FROM orders o
    JOIN customer c ON o.customer_id = c.customer_id
    JOIN order_item oi ON o.order_id = oi.order_id
    JOIN product_variant v ON oi.variant_id = v.variant_id
    JOIN product p ON v.product_id = p.product_id
    ORDER BY o.order_date DESC;
END$$

DELIMITER ;

-- Lấy thông tin order
DELIMITER $$

CREATE PROCEDURE GetCustomerOrdersByStatus(
    IN p_customer_id INT,
    IN p_status VARCHAR(20),  -- để linh hoạt, không dùng ENUM trong procedure
    IN p_page INT,
    IN p_pageSize INT
)
BEGIN
    DECLARE offset_val INT;
    SET offset_val = (p_page - 1) * p_pageSize;

    SELECT 
        o.order_id,
        o.order_date,
        o.total,
        o.status,
        oi.order_item_id,
        oi.quantity,
        oi.price,
        pv.variant_id,
        pv.color,
        pv.size,
        pv.image AS variant_image,
        p.product_name,
        p.image AS product_image
    FROM orders o
    JOIN order_item oi ON o.order_id = oi.order_id
    JOIN product_variant pv ON oi.variant_id = pv.variant_id
    JOIN product p ON pv.product_id = p.product_id
    WHERE o.customer_id = p_customer_id
      AND (p_status IS NULL OR o.status = p_status)
    ORDER BY o.order_date DESC
    LIMIT p_pageSize OFFSET offset_val;
END $$

DELIMITER ;

CALL GetCustomerOrdersByStatus(1, 'đang chờ', 1, 10);

-- khi hủy đơn
DELIMITER $$

CREATE PROCEDURE cancel_order (IN p_order_id INT)
BEGIN
    DECLARE v_old_status ENUM('đang chờ','đã xác nhận','đang vận chuyển','đã giao','trả hàng','đã hủy');

    SELECT status INTO v_old_status FROM orders WHERE order_id = p_order_id;

    IF v_old_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Đơn hàng không tồn tại';
    ELSEIF v_old_status != 'đang chờ' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Chỉ được hủy khi đơn hàng đang chờ xử lý';
    ELSE
        UPDATE orders SET status = 'đã hủy' WHERE order_id = p_order_id;
        INSERT INTO order_tracking (order_id, status, note)
        VALUES (p_order_id, 'đã hủy', 'Khách hàng hủy đơn hàng');
    END IF;
END $$

DELIMITER ;

-- KHi trả hàng
DELIMITER $$

CREATE PROCEDURE return_order (IN p_order_id INT)
BEGIN
    DECLARE v_old_status ENUM('đang chờ','đã xác nhận','đang vận chuyển','đã giao','trả hàng','đã hủy');

    SELECT status INTO v_old_status FROM orders WHERE order_id = p_order_id;

    IF v_old_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Đơn hàng không tồn tại';
    ELSEIF v_old_status != 'đã giao' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Chỉ được trả hàng khi đơn hàng đã giao';
    ELSE
        UPDATE orders SET status = 'trả hàng' WHERE order_id = p_order_id;
        INSERT INTO order_tracking (order_id, status, note)
        VALUES (p_order_id, 'trả hàng', 'Khách hàng yêu cầu trả hàng');
    END IF;
END $$

DELIMITER ;

-- KHi cập nhập trạng thái bình thường
DELIMITER $$

CREATE PROCEDURE update_order_status (
    IN p_order_id INT,
    IN p_new_status ENUM('đang chờ', 'đã xác nhận', 'đang vận chuyển', 'đã giao', 'trả hàng', 'đã hủy'),
    IN p_note VARCHAR(255)
)
BEGIN
    DECLARE v_old_status ENUM('đang chờ', 'đã xác nhận', 'đang vận chuyển', 'đã giao', 'trả hàng', 'đã hủy');

    SELECT status INTO v_old_status FROM orders WHERE order_id = p_order_id;

    IF v_old_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Đơn hàng không tồn tại';
    ELSEIF v_old_status = p_new_status THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Trạng thái mới trùng trạng thái hiện tại';
    ELSE
        UPDATE orders SET status = p_new_status WHERE order_id = p_order_id;
        INSERT INTO order_tracking (order_id, status, note)
        VALUES (p_order_id, p_new_status, CONCAT('Đổi từ ', v_old_status, ' sang ', p_new_status, '. ', p_note));
    END IF;
END $$

DELIMITER ;

-- hiển thị chi tiết đơn hàng
DELIMITER $$

CREATE PROCEDURE get_order_detail_full(IN orderId INT)
BEGIN
    DECLARE lastUpdate DATETIME;
    -- Lấy thời điểm cập nhật mới nhất trong bảng order_tracking
    SELECT MAX(updated_at)
    INTO lastUpdate
    FROM order_tracking
    WHERE order_id = orderId;

    -- Lấy chi tiết đơn hàng (kèm sản phẩm, biến thể, màu, size, hình ảnh)
    SELECT 
        o.order_id, 
        o.status, 
        o.order_date, 
        o.total, 
        o.shipping_address,
        lastUpdate AS last_update,
        p.product_id,
        p.product_name,
        p.description,
        p.price AS base_price,
        pv.variant_id,
        pv.color,
        pv.size,
        pv.image AS variant_image,
        oi.quantity,
        oi.price AS order_price
    FROM orders o
    LEFT JOIN order_item oi ON o.order_id = oi.order_id
    LEFT JOIN product_variant pv ON oi.variant_id = pv.variant_id
    LEFT JOIN product p ON pv.product_id = p.product_id
    WHERE o.order_id = orderId;
END $$

DELIMITER ;