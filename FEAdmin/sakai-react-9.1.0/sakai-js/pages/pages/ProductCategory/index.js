import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import axios from 'axios';

const ProductCategoryCRUD = () => {
    const [categories, setCategories] = useState([]);
    const [categoryDialog, setCategoryDialog] = useState(false);
    const [category, setCategory] = useState({ category_name: '', category_image: '' });
    const [isEdit, setIsEdit] = useState(false);
    const toast = useRef(null);
    const CLOUDINARY_CLOUD_NAME = 'djklef3ei';
    const CLOUDINARY_SIGN_URL = 'http://localhost:8080/upload/sign';

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8080/categorys');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const openNew = () => {
        setCategory({ category_name: '', category_image: '' });
        setIsEdit(false);
        setCategoryDialog(true);
    };

    const hideDialog = () => {
        setCategoryDialog(false);
    };

    const saveCategory = async () => {
        try {
            if (isEdit) {
                await axios.put(`http://localhost:8080/categorys/${category.category_id}`, category);
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Category Updated', life: 3000 });
            } else {
                await axios.post('http://localhost:8080/categorys', category);
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Category Created', life: 3000 });
            }
            fetchCategories();
            setCategoryDialog(false);
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const editCategory = (cat) => {
        setCategory({ ...cat });
        setIsEdit(true);
        setCategoryDialog(true);
    };

    const deleteCategory = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/categorys/${id}`);
            fetchCategories();
            toast.current.show({ severity: 'warn', summary: 'Deleted', detail: 'Category Deleted', life: 3000 });
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const onUpload = async (event) => {
        const file = event.files[0];
        if (!file) return;

        try {
            // 🔹 Gọi backend để lấy chữ ký (signature)
            const signResponse = await axios.get(CLOUDINARY_SIGN_URL);
            const { timestamp, signature, api_key, cloud_name } = signResponse.data;

            // 🔹 Tạo formData để gửi ảnh lên Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', api_key);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', 'signed_uploads'); // Thư mục chứa ảnh trong Cloudinary

            // 🔹 Gửi ảnh lên Cloudinary
            const uploadResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
                formData
            );

            // 🔹 Lưu link ảnh vào category
            const imageUrl = uploadResponse.data.secure_url;
            setCategory({ ...category, category_image: imageUrl });

            toast.current.show({
                severity: 'success',
                summary: 'Upload thành công',
                detail: 'Ảnh đã được tải lên Cloudinary',
                life: 3000
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Lỗi upload',
                detail: 'Không thể tải ảnh lên Cloudinary',
                life: 3000
            });
        }
    };


    return (
        <div className="p-4">
            <Toast ref={toast} />
            <Button label="thêm loại sản phẩm" icon="pi pi-plus" className="p-button-success mb-3" onClick={openNew} />
            <h2>Quản lý loại sản phẩm</h2>
            <DataTable value={categories} responsiveLayout="scroll">
                <Column header="STT" body={(rowData, options) => options.rowIndex + 1} style={{ width: '70px', textAlign: 'center' }}></Column>
                <Column field="category_name" header="Tên loại" sortable></Column>
                <Column field="category_image" header="Hình ảnh" body={(rowData) => (
                    rowData.category_image ? <img src={rowData.category_image} alt={rowData.category_name} width="50" /> : 'No Image'
                )}></Column>
                <Column header="Hành động" body={(rowData) => (
                    <>
                        <Button icon="pi pi-pencil" className="p-button-warning mr-2" onClick={() => editCategory(rowData)} />
                        <Button icon="pi pi-trash" className="p-button-danger" onClick={() => deleteCategory(rowData.category_id)} />
                    </>
                )}></Column>
            </DataTable>

            <Dialog visible={categoryDialog} style={{ width: '450px' }} header="Thông tin loại sản phẩm" modal className="p-fluid" footer={
                <>
                    <Button label="Lưu" icon="pi pi-check" className="p-button-primary" onClick={saveCategory} />
                    <Button label="đóng" icon="pi pi-times" className="p-button-text" 
                    style={{
                        border: '1px solid var(--primary-color)',
                        color: 'var(--primary-color)',
                        borderRadius: '6px'
                    }} onClick={hideDialog} />
                </>
            } onHide={hideDialog}>
                <div className="p-field">
                    <label htmlFor="category_name">Tên loại sản phẩm</label>
                    <InputText id="category_name" className="mt-2" value={category.category_name} 
                    onChange={(e) => setCategory({ ...category, category_name: e.target.value })} required autoFocus 
                />
                </div>
                <div className="p-field">
                    <label>Ảnh loại sản phẩm</label>
                    <FileUpload  mode="basic" accept="image/*" className="mt-2" maxFileSize={20000000} customUpload uploadHandler={onUpload} auto chooseLabel="Tải ảnh" />
                    <InputText id="category_image" className="mt-2" value={category.category_image} 
                        onChange={(e) => setCategory({ ...category, category_image: e.target.value })} placeholder="URL ảnh"
                    />
                    {category.category_image && (
                        <img
                            src={category.category_image}
                            alt="Category Banner"
                            width="100"
                            className="mt-2"
                            style={{ borderRadius: "6px", border: "1px solid #ccc" }}
                        />
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default ProductCategoryCRUD;
