const Product_variant = require("../models/product_variant.model");

module.exports = {
    // 🔹 Lấy toàn bộ biến thể sản phẩm
    getAll: (req, res) => {
        Product_variant.getAll((err, result) => {
            if (err) {
                console.error("❌ Lỗi khi lấy danh sách product_variant:", err);
                return res.status(500).json({ message: "Lỗi server khi lấy dữ liệu product_variant." });
            }
            res.status(200).json(result);
        });
    },

    // 🔹 Lấy biến thể theo ID
    getById: (req, res) => {
        const id = req.params.id;
        Product_variant.getById(id, (err, result) => {
            if (err) {
                console.error("❌ Lỗi khi lấy product_variant theo ID:", err);
                return res.status(500).json({ message: "Lỗi server khi lấy product_variant." });
            }
            if (!result || result.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy product_variant." });
            }
            res.status(200).json(result[0]);
        });
    },

    // 🔹 Thêm mới product_variant
    insert: (req, res) => {
        const product_variant = req.body;
        Product_variant.insert(product_variant, (err, result) => {
            if (err) {
                console.error("❌ Lỗi khi thêm product_variant:", err);
                return res.status(500).json({ message: "Không thể thêm product_variant." });
            }
            res.status(201).json({
                message: "Thêm product_variant thành công.",
                data: result,
            });
        });
    },

    // 🔹 Cập nhật product_variant theo ID
    update: (req, res) => {
        const product_variant = req.body;
        const id = req.params.id;

        Product_variant.update(product_variant, id, (err, result) => {
            if (err) {
                console.error("❌ Lỗi khi cập nhật product_variant:", err);
                return res.status(500).json({ message: "Không thể cập nhật product_variant." });
            }
            res.status(200).json({
                message: "Cập nhật product_variant thành công.",
                data: result,
            });
        });
    },

    // 🔹 Xóa product_variant
    delete: (req, res) => {
        const id = req.params.id;
        Product_variant.delete(id, (err, result) => {
            if (err) {
                console.error("❌ Lỗi khi xóa product_variant:", err);
                return res.status(500).json({ message: "Không thể xóa product_variant." });
            }
            res.status(200).json({
                message: `Xóa product_variant id = ${id} thành công.`,
            });
        });
    },

    // 🔹 Lấy danh sách variant theo product_id
    GetByIDProduct: (req, res) => {
        const id = req.params.id;
        Product_variant.GetByIDProduct(id, (err, result) => {
            if (err) {
                console.error("❌ Lỗi khi lấy biến thể theo product_id:", err);
                return res.status(500).json({ message: "Lỗi server khi lấy biến thể sản phẩm." });
            }
            res.status(200).json(result);
        });
    },

    // 🔹 Lấy chi tiết variant theo variant_id (gồm thông tin sản phẩm)
    GetByIDVariant: (req, res) => {
        const id = req.params.id;
        Product_variant.GetByIDVariant(id, (err, result) => {
            if (err) {
                console.error("❌ Lỗi khi lấy chi tiết variant:", err);
                return res.status(500).json({ message: "Lỗi server khi lấy chi tiết biến thể." });
            }
            if (!result || result.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy biến thể." });
            }
            res.status(200).json(result[0]);
        });
    },

    // 🔹 Cập nhật tồn kho theo product_id + size + color
    updateStock: (req, res) => {
        const { id, size, color } = req.params;
        const { stock } = req.body;

        if (!id || !size || !color) {
            return res.status(400).json({ message: "Thiếu thông tin id, size hoặc color." });
        }

        Product_variant.updateStock(id, size, stock, color, (err, result) => {
            if (err) {
                console.error("❌ Lỗi khi cập nhật tồn kho:", err);
                return res.status(500).json({ message: "Không thể cập nhật tồn kho." });
            }
            res.status(200).json({
                message: "✅ Cập nhật tồn kho thành công.",
                data: result,
            });
        });
    },

    // 🔹 Lấy số lượng tồn kho theo product_id + size + color
    getStockByVariant: (req, res) => {
        const { id, size, color } = req.params;

        Product_variant.GetStock(id, size, color, (err, result) => {
            if (err) {
                console.error("❌ Lỗi khi lấy tồn kho:", err);
                return res.status(500).json({ message: "Lỗi server khi lấy tồn kho." });
            }

            if (!result || result.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy biến thể sản phẩm." });
            }

            res.status(200).json(result[0]);
        });
    },
};
