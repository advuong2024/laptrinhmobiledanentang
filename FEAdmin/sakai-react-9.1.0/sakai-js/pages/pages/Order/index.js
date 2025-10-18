import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import axios from 'axios';

const API_BASE = 'http://localhost:8080';

const OrderAdmin = () => {
    const toast = useRef(null);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [detailDialog, setDetailDialog] = useState(false);
    const [statusDialog, setStatusDialog] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('');
    const [customerInfo, setCustomerInfo] = useState(null);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [customerNames, setCustomerNames] = useState({});
    const [orderStatus, setOrderStatus] = useState('');
    const [originalPayment, setOriginalPayment] = useState('');
    const [originalOrder, setOriginalOrder] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API_BASE}/orders`);
            setOrders(res.data);
            await Promise.all([
                fetchCustomerNames(res.data)
            ]);
        } catch (err) {
            console.error('Lỗi lấy đơn hàng:', err);
        }
    };

    const fetchOrderDetails = async (orderId) => {
        try {
            const [detailsRes, productsRes, orderRes, paymentRes] = await Promise.all([
                axios.get(`${API_BASE}/order_items/order/${orderId}`),
                axios.get(`${API_BASE}/product_variants`),
                axios.get(`${API_BASE}/orders/${orderId}`),
                axios.get(`${API_BASE}/payments/order/${orderId}`)
            ]);

            console.log('Payment data:', paymentRes.data);

            const order = orderRes.data[0];
            const userId = order?.customer_id;
            const payment = paymentRes.data;

            console.log('Payment data:', payment);

            setSelectedOrder(order);
            setPaymentInfo(payment);


            // Lấy thông tin người đặt (user hoặc guest)
            if (userId) {
                const userRes = await axios.get(`${API_BASE}/customers/${userId}`);
                setCustomerInfo(userRes.data[0]);
            } else {
                const guestRes = await axios.get(`${API_BASE}/Guest/${order?.guest_id}`);
                setCustomerInfo(guestRes.data[0]);
            }

            const productMap = Object.fromEntries(productsRes.data.map((p) => [p.variant_id, p]));

            const enriched = detailsRes.data.map((detail) => {
            const product = productMap[detail.variant_id] || {};
            const totalPrice = detail.quantity * parseFloat(detail.price);
            return {
                ...detail,
                product_name: product.product_name || detail.product_name || 'Không rõ',
                image: product.image_url || detail.product_image || '',
                totalPrice
            };
            });

            setOrderDetails(enriched);
            setDetailDialog(true);
        } catch (err) {
            console.error('Lỗi lấy chi tiết đơn hàng:', err);
        }
    };

    const fetchStatuses = async (order) => {
        setSelectedOrder(order);
        try {
            const [payRes, trackRes] = await Promise.all([
                axios.get(`${API_BASE}/Payments/Order/${order.order_id}`),
                axios.get(`${API_BASE}/Orders/${order.order_id}/tracking`)
            ]);

            const payment = payRes.data?.[0]?.status || 'chưa thanh toán';
            const orderStat = trackRes.data?.[0]?.status || 'đang chờ';

            setPaymentStatus(payment);
            setOrderStatus(orderStat);

            setOriginalPayment(payment);
            setOriginalOrder(orderStat);

        } catch (err) {
            console.error('Lỗi khi lấy trạng thái:', err);
            toast.current.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể tải trạng thái đơn hàng.',
                life: 3000
            });
        }
        setStatusDialog(true);
    };


    const handleUpdateStatus = async () => {
        if (!selectedOrder) return;

        try {
            let updatedSomething = false;

            // ✅ Chỉ cập nhật thanh toán nếu thay đổi
            if (paymentStatus !== originalPayment) {
                await axios.put(`${API_BASE}/Payments/${selectedOrder.order_id}`, {
                    ...paymentInfo,
                    status: paymentStatus,
                });
                updatedSomething = true;
                toast.current.show({
                    severity: 'success',
                    summary: 'Cập nhật thanh toán',
                    detail: `Đã cập nhật trạng thái thanh toán sang "${paymentStatus}".`,
                    life: 2500
                });
            }

            // ✅ Chỉ cập nhật đơn hàng nếu thay đổi
            if (orderStatus !== originalOrder) {
                await axios.put(`${API_BASE}/Orders/${selectedOrder.order_id}/status`, {
                    newStatus: orderStatus,
                    note: `Shop cập nhật trạng thái đơn hàng sang "${orderStatus}".`
                });
                updatedSomething = true;
                toast.current.show({
                    severity: 'success',
                    summary: 'Cập nhật đơn hàng',
                    detail: `Đã cập nhật trạng thái đơn hàng sang "${orderStatus}".`,
                    life: 2500
                });
            }

            const orderRes = await axios.get(`${API_BASE}/Orders/${selectedOrder.order_id}`);
            const updatedOrder = Array.isArray(orderRes.data) ? orderRes.data[0] : orderRes.data;

            const paymentRes = await axios.get(`${API_BASE}/Payments/Order/${selectedOrder.order_id}`);
            const updatedPayment = paymentRes.data;

            console.log('Updated Order:', updatedOrder.status);
            console.log('Updated Payment:', updatedPayment.status);

            // ✅ Nếu đơn hàng đã giao & thanh toán xong → trừ kho
            if (
                updatedOrder.status === 'đã giao' &&
                updatedPayment.status === 'đã thanh toán'
            ) {
                const detailsRes = await axios.get(
                    `${API_BASE}/order_items/order/${selectedOrder.order_id}`
                );

                const grouped = {};
                for (const detail of detailsRes.data) {
                    const key = `${detail.product_id}_${detail.size}_${detail.color}`;
                    if (!grouped[key]) {
                        grouped[key] = {
                            product_id: detail.product_id,
                            size: detail.size,
                            color: detail.color,
                            quantity: detail.quantity
                        };
                    } else {
                        grouped[key].quantity += detail.quantity;
                    }
                }

                for (const key in grouped) {
                    const { product_id, size, color, quantity } = grouped[key];
                    const variantRes = await axios.get(
                        `${API_BASE}/product_variants/stock/${product_id}/${size}/${color}`
                    );
                    const variant = variantRes.data;

                    if (!variant || variant.stock < quantity) {
                        toast.current.show({
                            severity: 'error',
                            summary: 'Thiếu hàng',
                            detail: `Không đủ tồn kho cho sản phẩm ID ${product_id} - size ${size}.`,
                            life: 4000
                        });

                        // 🔹 Hủy đơn hàng nếu thiếu hàng
                        await axios.delete(`${API_BASE}/Orders/${selectedOrder.order_id}`);
                        fetchOrders();
                        setStatusDialog(false);
                        return;
                    }

                    const newStock = variant.stock - quantity;
                    await axios.put(`${API_BASE}/product_variants/${product_id}/${size}/${color}`, {
                        ...variant,
                        stock: newStock
                    });
                }

                toast.current.show({
                    severity: 'success',
                    summary: 'Trừ kho thành công',
                    detail: 'Hệ thống đã cập nhật tồn kho sau khi giao hàng.',
                    life: 3000
                });
            }

            toast.current.show({
                severity: 'success',
                summary: 'Cập nhật thành công',
                detail: 'Đã cập nhật trạng thái đơn hàng hoặc thanh toán (nếu có thay đổi).',
                life: 3000
            });

            fetchOrders();
            setStatusDialog(false);
        } catch (err) {
            console.error('Lỗi cập nhật trạng thái:', err);
            toast.current.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể cập nhật trạng thái.',
                life: 3000
            });
        }
    };

    const formatCurrency = (value) => value?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    const totalAmount = () => formatCurrency(orderDetails.reduce((acc, cur) => acc + cur.totalPrice, 0));

    const fetchCustomerNames = async (reviewList) => {
        const namesMap = {};
        for (const review of reviewList) {
            const id = review.customer_id;
            if (!namesMap[id]) {
                try {
                    const res = await axios.get(`http://localhost:8080/customers/${id}`);
                    // ✅ Nếu API trả về mảng
                    const customer = Array.isArray(res.data) ? res.data[0] : res.data;
                    namesMap[id] = customer?.fullname || 'Không xác định';
                } catch (err) {
                    console.error('Lỗi lấy tên khách hàng:', err);
                    namesMap[id] = 'Không xác định';
                }
            }
        }
        setCustomerNames(namesMap);
    };

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <h2>Quản lí đơn hàng</h2>

            <DataTable value={orders} responsiveLayout="scroll">
                <Column header="STT" body={(rowData, options) => options.rowIndex + 1} style={{ width: '70px', textAlign: 'center' }}></Column>
                <Column field="customer_id" header="Tên khách hàng" body={(rowData) => customerNames[rowData.customer_id] || 'Đang tải...'} />
                <Column field="order_date" header="Ngày đặt" body={(row) => formatDate(row.order_date)} />
                <Column field="total" header="Tổng tiền" body={(row) => formatCurrency(Number(row.total))} />
                <Column field="status" header="Trạng thái" />
                <Column
                    header="Thao tác"
                    body={(row) => (
                        <>
                            <Button label="Chi tiết" icon="pi pi-eye" className="p-button-info mr-2" onClick={() => fetchOrderDetails(row.order_id)} />
                            {row.status !== 'đã hủy' && (
                                <Button
                                    label="Trạng thái"
                                    icon="pi pi-pencil"
                                    className="p-button-warning"
                                    onClick={() => fetchStatuses(row)}
                                />
                            )}
                        </>
                    )}
                />
            </DataTable>

            <Dialog visible={detailDialog} header="Chi tiết đơn hàng" style={{ width: '800px' }} modal onHide={() => setDetailDialog(false)}>
                <div className="mb-4">
                    <h5>Thông tin người đặt:</h5>
                    {customerInfo ? (
                        <div>
                            <p>
                                <strong>Họ tên:</strong> {customerInfo.fullname || 'N/A'}
                            </p>
                            <p>
                                <strong>Email:</strong> {customerInfo.email || 'N/A'}
                            </p>
                            <p>
                                <strong>Số điện thoại:</strong> {customerInfo.phone || 'N/A'}
                            </p>
                            <p>
                                <strong>Địa chỉ:</strong> {customerInfo.address || 'N/A'}
                            </p>
                        </div>
                    ) : (
                        <p>Không có thông tin người đặt.</p>
                    )}

                    <h5 className="mt-3">Trạng thái thanh toán:</h5>
                    <p>{paymentInfo?.status === 'đã thanh toán' ? <span className="text-green-600 font-semibold">Đã thanh toán</span> : <span className="text-red-600 font-semibold">Chưa thanh toán</span>}</p>
                </div>

                <DataTable value={orderDetails} responsiveLayout="scroll">
                    <Column field="product_name" header="Tên sản phẩm" />
                    <Column header="Hình ảnh" body={(row) => (row.image ? <img src={row.image} width={50} alt="product" /> : 'No image')} />
                    <Column field="size" header="Kích cỡ" />
                    <Column field="color" header="Màu sắc" />
                    <Column field="quantity" header="Số lượng" />
                    <Column field="price" header="Thành tiền" body={(row) => formatCurrency(row.price)} />
                </DataTable>

                <div className="text-right mt-3">
                    <strong>Tổng tiền: {totalAmount()}</strong>
                </div>
            </Dialog>

            <Dialog
                header="Cập nhật trạng thái"
                visible={statusDialog}
                onHide={() => setStatusDialog(false)}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button label="Hủy" icon="pi pi-times" onClick={() => setStatusDialog(false)} />
                        <Button label="Lưu thay đổi" icon="pi pi-check" onClick={handleUpdateStatus} />
                    </div>
                }
            >
                <div className="flex flex-col gap-4">
                    {/* Dropdown trạng thái thanh toán */}
                    <div>
                        <label className="block mb-2 font-semibold">Trạng thái thanh toán</label>
                        <select
                            value={paymentStatus}
                            onChange={(e) => setPaymentStatus(e.target.value)}
                            className="p-2 border rounded w-full"
                        >
                            <option value="chưa thanh toán">Chưa thanh toán</option>
                            <option value="đã thanh toán">Đã thanh toán</option>
                            <option value="đã hoàn trả">Đã hoàn trả</option>
                        </select>
                    </div>

                    {/* Dropdown trạng thái đơn hàng */}
                    <div>
                        <label className="block mb-2 font-semibold">Trạng thái đơn hàng</label>
                        <select
                            value={orderStatus}
                            onChange={(e) => setOrderStatus(e.target.value)}
                            className="p-2 border rounded w-full"
                        >
                            <option value="đang chờ">Đang chờ</option>
                            <option value="đã xác nhận">Đã xác nhận</option>
                            <option value="đang vận chuyển">Đang vận chuyển</option>
                            <option value="đã giao">Đã giao</option>
                            <option value="trả hàng">Trả hàng</option>
                            <option value="đã hủy">Đã hủy</option>
                        </select>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default OrderAdmin;
