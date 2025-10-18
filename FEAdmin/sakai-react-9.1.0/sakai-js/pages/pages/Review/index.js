import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import axios from 'axios';

const ProductReviewCRUD = () => {
    const [reviews, setReviews] = useState([]);
    const [productNames, setProductNames] = useState({});
    const [customerNames, setCustomerNames] = useState({});
    const toast = useRef(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await axios.get('http://localhost:8080/reviews');
            setReviews(response.data.data || []);

            // Sau khi có danh sách đánh giá -> gọi song song API để lấy tên
            await Promise.all([
                fetchProductNames(response.data.data || []),
                fetchCustomerNames(response.data.data || [])
            ]);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const fetchProductNames = async (reviewList) => {
        const namesMap = {};
        for (const review of reviewList) {
            const id = review.product_id;
            if (!namesMap[id]) {
                try {
                    const res = await axios.get(`http://localhost:8080/products/${id}`);
                    // ✅ Nếu API trả về mảng
                    const product = Array.isArray(res.data) ? res.data[0] : res.data;
                    namesMap[id] = product?.product_name || 'Không xác định';
                } catch (err) {
                    console.error('Lỗi lấy tên sản phẩm:', err);
                    namesMap[id] = 'Không xác định';
                }
            }
        }
        setProductNames(namesMap);
    };

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

    const deleteReview = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/Reviews/${id}`);
            fetchReviews();
            toast.current.show({ severity: 'warn', summary: 'Deleted', detail: 'Review Deleted', life: 3000 });
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const formatDate = (dateObj) => {
        const date = new Date(dateObj);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <h2>Quản lý đánh giá sản phẩm</h2>

            <DataTable value={reviews} responsiveLayout="scroll">
                <Column header="STT" body={(rowData, options) => options.rowIndex + 1} style={{ width: '70px', textAlign: 'center' }}></Column>
                <Column field="product_id" header="Tên sản phẩm" body={(rowData) => productNames[rowData.product_id] || 'Đang tải...'} />
                <Column field="customer_id" header="Tên khách hàng" body={(rowData) => customerNames[rowData.customer_id] || 'Đang tải...'} />
                <Column field="rating" header="Đánh giá" sortable></Column>
                <Column field="comment" header="Bình luận"></Column>
                <Column field="created_at" header="Ngày đánh giá" body={(rowData) => formatDate(rowData.created_at)} sortable></Column>

                <Column
                    header="Hành động"
                    body={(rowData) => (
                        <Button icon="pi pi-trash" className="p-button-danger" onClick={() => deleteReview(rowData.review_id)} />
                    )}
                />
            </DataTable>
        </div>
    );
};

export default ProductReviewCRUD;
