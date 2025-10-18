import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import axios from 'axios';

const CLOUDINARY_CLOUD_NAME = 'djklef3ei';
const CLOUDINARY_SIGN_URL = 'http://localhost:8080/upload/sign';
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL'];

const ProductCRUD = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productDialog, setProductDialog] = useState(false);
    const [variantDialog, setVariantDialog] = useState(false);
    const [detailDialog, setDetailDialog] = useState(false);
    const [product, setProduct] = useState({ product_name: '', description: '', price: 0, image: '', category_id: '' });
    const [variants, setVariants] = useState([]);
    const [details, setDetails] = useState([]);
    const [newVariant, setNewVariant] = useState({ size: '', color: '', stock: 0, image: '' });
    const [newDetail, setNewDetail] = useState({ detail_key: '', detail_value: '' });
    const [isEdit, setIsEdit] = useState(false);
    const [categoryNames, setCategoryNames] = useState({});
    const [isEditingVariant, setIsEditingVariant] = useState(false);
    const [editingVariantId, setEditingVariantId] = useState(null);
    const [isEditingDetail, setIsEditingDetail] = useState(false);
    const [editingDetailId, setEditingDetailId] = useState(null);
    const toast = useRef(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:8080/Products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8080/categorys');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const openNew = () => {
        setProduct({ product_name: '', description: '', price: 0, image: '', category_id: '' });
        setIsEdit(false);
        setProductDialog(true);
    };

    const hideDialog = () => {
        setProductDialog(false);
    };

    const saveProduct = async () => {
        try {
            if (isEdit) {
                await axios.put(`http://localhost:8080/Products/${product.product_id}`, product);
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Product Updated', life: 3000 });
            } else {
                await axios.post('http://localhost:8080/Products', product);
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Product Created', life: 3000 });
            }
            fetchProducts();
            setProductDialog(false);
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const editProduct = (prod) => {
        setProduct({ ...prod });
        setIsEdit(true);
        setProductDialog(true);
    };

    const deleteProduct = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:3000/Products/${id}`);
            fetchProducts();
            toast.current.show({ severity: 'warn', summary: 'Deleted', detail: 'Product Deleted', life: 3000 });
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const openVariantDialog = async (prod) => {
        try {
            setProduct(prod);
            const response = await axios.get(`http://localhost:8080/product_variants/productid/${prod.product_id}`);
            const sorted = Array.isArray(response.data)
                ? response.data.sort((a, b) => SIZE_OPTIONS.indexOf(a.size) - SIZE_OPTIONS.indexOf(b.size))
                : [];
            setVariants(sorted);
            setNewVariant({ size: '', color: '', stock: 0, image: '' });
            setVariantDialog(true);
        } catch (error) {
            console.error('Error fetching variants:', error);
        }
    };

    const saveVariant = async () => {
        if (!newVariant.size || !newVariant.color || newVariant.stock <= 0) {
            toast.current.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Vui lòng nhập đầy đủ thông tin (size, màu, số lượng)',
                life: 3000,
            });
            return;
        }

        try {
            // 🔹 Kiểm tra xem biến thể có tồn tại chưa
            const existingVariant = variants.find(
                (v) =>
                    v.size.trim().toLowerCase() === newVariant.size.trim().toLowerCase() &&
                    v.color.trim().toLowerCase() === newVariant.color.trim().toLowerCase()
            );

            if (existingVariant) {
                // 🔹 Nếu đã tồn tại → Cập nhật stock + ảnh nếu có ảnh mới
                const updatedVariant = {
                    ...existingVariant,
                    stock: existingVariant.stock + Number(newVariant.stock),
                    image: newVariant.image || existingVariant.image, // Giữ ảnh cũ nếu không upload ảnh mới
                };

                await axios.put(
                    `http://localhost:8080/product_variants/${existingVariant.variant_id}`,
                    updatedVariant
                );

                toast.current.show({
                    severity: 'info',
                    summary: 'Đã cập nhật',
                    detail: `Đã cộng thêm ${newVariant.stock} cho size ${newVariant.size}, màu ${newVariant.color}`,
                    life: 3000,
                });
            } else {
                // 🔹 Nếu chưa có → thêm mới
                const variant = { ...newVariant, product_id: product.product_id };
                await axios.post('http://localhost:8080/product_variants', variant);

                toast.current.show({
                    severity: 'success',
                    summary: 'Thêm mới',
                    detail: `Đã thêm biến thể size ${newVariant.size}, màu ${newVariant.color}`,
                    life: 3000,
                });
            }

            openVariantDialog(product); // Refresh lại danh sách variant
        } catch (err) {
            console.error(err);
            toast.current.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể lưu biến thể',
                life: 3000,
            });
        }
    };

    const editVariant = (variant) => {
        setNewVariant({
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
            image: variant.image
        });
        setIsEditingVariant(true);
        setEditingVariantId(variant.variant_id);
    };

    const updateVariant = async () => {
        if (!editingVariantId) return;

        try {
            const updatedVariant = { ...newVariant, product_id: product.product_id };
            await axios.put(`http://localhost:8080/product_variants/${editingVariantId}`, updatedVariant);

            toast.current.show({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Cập nhật biến thể thành công',
                life: 3000
            });

            setIsEditingVariant(false);
            setEditingVariantId(null);
            setNewVariant({ size: '', color: '', stock: 0, image: '' });
            openVariantDialog(product);
        } catch (err) {
            console.error('❌ Lỗi cập nhật biến thể:', err);
            toast.current.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể cập nhật biến thể',
                life: 3000
            });
        }
    };

    const deleteVariant = async (variant_id) => {
        try {
            await axios.delete(`http://127.0.0.1:3000/product_variants/${variant_id}`);
            toast.current.show({ severity: 'warn', summary: 'Deleted', detail: 'Variant Deleted', life: 2000 });
            openVariantDialog(product);
        } catch (err) {
            console.error('Error deleting variant:', err);
        }
    };

    const openDetailDialog = async (prod) => {
        try {
            setProduct(prod);
            const response = await axios.get(`http://localhost:8080/product_details/productid/${prod.product_id}`);
            setDetails(Array.isArray(response.data) ? response.data : []);
            setNewDetail({ detail_key: '', detail_value: '' });
            setDetailDialog(true);
        } catch (err) {
            console.error('Error fetching details:', err);
        }
    };

    const saveDetail = async () => {
        if (!newDetail.detail_key || !newDetail.detail_value) {
            toast.current.show({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đầy đủ thông tin', life: 2000 });
            return;
        }
        try {
            await axios.post('http://localhost:8080/product_details', { ...newDetail, product_id: product.product_id });
            toast.current.show({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm chi tiết', life: 2000 });
            openDetailDialog(product);
        } catch (err) {
            toast.current.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể thêm chi tiết', life: 2000 });
        }
    };

    const deleteDetail = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/product_details/${id}`);
            toast.current.show({ severity: 'warn', summary: 'Xóa', detail: 'Chi tiết đã bị xóa', life: 2000 });
            openDetailDialog(product);
        } catch (err) {
            console.error('Error deleting detail:', err);
        }
    };

    const editDetail = async (detail) => {
        setNewDetail({
            detail_key: detail.detail_key,
            detail_value: detail.detail_value,
        });
        setIsEditingDetail(true);
        setEditingDetailId(detail.detail_id);
    };

    const updateDetail = async () => {
        if (!editingDetailId) return;
        try {
                await axios.put(`http://localhost:8080/product_details/${editingDetailId}`, {
                  ...newDetail,
                product_id: product.product_id,
            });
                toast.current.show({
                    severity: 'success',
                    summary: 'Cập nhật',
                    detail: 'Cập nhật chi tiết thành công',
               life: 2000,
            });
            setIsEditingDetail(false);
            setEditingDetailId(null);
            setNewDetail({ detail_key: '', detail_value: '' });
            openDetailDialog(product);
        } catch (err) {
            toast.current.show({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không thể cập nhật chi tiết',
                life: 2000,
            });
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

            // 🔹 Lưu link ảnh vào product
            const imageUrl = uploadResponse.data.secure_url;
            setProduct({ ...product, image: imageUrl });

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

    const onUploadVariant = async (event) => {
        const file = event.files[0];
        if (!file) return;

        try {
            const signResponse = await axios.get(CLOUDINARY_SIGN_URL);
            const { timestamp, signature, api_key, cloud_name } = signResponse.data;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', api_key);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', 'product_variants');

            const uploadResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
                formData
            );

            const imageUrl = uploadResponse.data.secure_url;
            setNewVariant({ ...newVariant, image: imageUrl });

            toast.current.show({
                severity: 'success',
                summary: 'Upload thành công',
                detail: 'Ảnh biến thể đã được tải lên Cloudinary',
                life: 3000,
            });
        } catch (error) {
            console.error('Error uploading variant image:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Lỗi upload',
                detail: 'Không thể tải ảnh biến thể lên',
                life: 3000,
            });
        }
    }

    const formatCurrencyVND = (value) => {
        return value?.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND'
        });
    };

    useEffect(() => {
        const fetchCategoryNames = async () => {
            const namesMap = {};
            for (const p of products) {
                try {
                    const response = await axios.get(`http://localhost:8080/categorys/${p.category_id}`);
                    if (Array.isArray(response.data) && response.data.length > 0) {
                        namesMap[p.category_id] = response.data[0].category_name;
                    } else {
                        namesMap[p.category_id] = 'Không xác định';
                    }
                } catch (error) {
                    console.error('❌ Lỗi lấy category:', error);
                }
            }
            setCategoryNames(namesMap);
        };

        if (products.length > 0) fetchCategoryNames();
    }, [products]);

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <Button label="Thêm sản phẩm" icon="pi pi-plus" className="p-button-success mb-3" onClick={openNew} />
            <h2>Quản lí sản phẩm</h2>
            <DataTable value={products} responsiveLayout="scroll">
                <Column header="STT" body={(rowData, { rowIndex }) => rowIndex + 1} sortable/>
                <Column field="product_name" header="Tên sản phẩm" sortable />
                <Column
                    field="description"
                    header="Mô tả"
                    body={(row) => (row.description?.length > 50 ? row.description.slice(0, 50) + '...' : row.description)}
                />
                <Column field="price" header="Giá" body={(row) => formatCurrencyVND(Number(row.price))} />
                <Column field="category_id" header="Danh mục"
                    body={(rowData) => categoryNames[rowData.category_id] || 'Đang tải...'}
                />
                <Column field="image" header="Ảnh" body={(row) => row.image ? <img src={row.image} width="50" /> : '—'} />
                <Column
                    header="Hành động"
                    body={(row) => (
                        <>
                            <Button icon="pi pi-pencil" className="p-button-warning mr-2" onClick={() => editProduct(row)} />
                            <Button icon="pi pi-eye" className="p-button-info mr-2" onClick={() => openVariantDialog(row)} tooltip="Biến thể" />
                            <Button icon="pi pi-list" className="p-button-help mr-2" onClick={() => openDetailDialog(row)} tooltip="Chi tiết" />
                            <Button icon="pi pi-trash" className="p-button-danger" onClick={() => deleteProduct(row.product_id)} />
                        </>
                    )}
                />
            </DataTable>

            {/* Product Dialog */}
            <Dialog visible={productDialog} style={{ width: '450px' }} header="Thông tin sản phẩm" modal className="p-fluid" onHide={hideDialog}
                footer={<><Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} /><Button label="Save" icon="pi pi-check" className="p-button-primary" onClick={saveProduct} /></>}>
                <div className="p-field">
                    <label htmlFor="category_id">Danh mục</label>
                    <Dropdown id="category_id" value={product.category_id} options={categories} onChange={(e) => setProduct({ ...product, category_id: e.value })} optionLabel="category_name" optionValue="category_id" placeholder="Select Category" />
                </div>
                <div className="p-field">
                    <label htmlFor="product_name">Tên sản phẩm</label>
                    <InputText id="product_name" value={product.product_name} onChange={(e) => setProduct({ ...product, product_name: e.target.value })} required autoFocus />
                </div>
                <div className="p-field">
                    <label htmlFor="description">Mô tả</label>
                    <InputText id="description" value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} required />
                </div>
                <div className="p-field">
                    <label htmlFor="price">Giá</label>
                    <InputText id="price" type="number" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} required />
                </div>
                <div className="p-field">
                    <label>Ảnh sản phẩm</label>
                    <FileUpload className='mt-2'  mode="basic" accept="image/*" customUpload uploadHandler={onUpload} auto chooseLabel="Tải ảnh" />
                    <InputText value={product.image} onChange={(e) => setProduct({ ...product, image: e.target.value })}
                        placeholder="URL ảnh" className="mt-2"
                    />
                    {product.image && (
                        <img src={product.image} alt="Product" width="100" className="mt-2" />
                    )}
                </div>
            </Dialog>
            
            {/* Detail Dialog */}
            <Dialog
                visible={detailDialog}
                style={{ width: '600px' }}
                header={`Chi tiết sản phẩm - ${product.product_name}`}
                modal
                onHide={() => {
                    setDetailDialog(false);
                    setIsEditingDetail(false);
                    setEditingDetailId(null);
                    setNewDetail({ detail_key: '', detail_value: '' });
                }}
            >
                <div className="p-fluid mb-3">
                    <div className="p-field mt-2">
                        <InputText
                            placeholder="Thuộc tính (VD: Chất liệu)"
                            value={newDetail.detail_key}
                            onChange={(e) => setNewDetail({ ...newDetail, detail_key: e.target.value })}
                            disabled={isEditingDetail} // không cho sửa tên thuộc tính khi edit
                        />
                    </div>
                    <div className="p-field mt-2">
                        <InputText
                            placeholder="Giá trị (VD: Cotton 100%)"
                            value={newDetail.detail_value}
                            onChange={(e) => setNewDetail({ ...newDetail, detail_value: e.target.value })}
                        />
                    </div>
                    <div className="p-col-2 pt-2 flex gap-2">
                        {isEditingDetail ? (
                            <>
                                <Button
                                    label="Lưu thay đổi"
                                    icon="pi pi-save"
                                    className="p-button-success"
                                    onClick={updateDetail}
                                />
                                <Button
                                    label="Hủy"
                                    icon="pi pi-times"
                                    className="p-button-secondary"
                                    onClick={() => {
                                        setIsEditingDetail(false);
                                        setEditingDetailId(null);
                                        setNewDetail({ detail_key: '', detail_value: '' });
                                    }}
                                />
                            </>
                        ) : (
                            <Button
                                label="Thêm chi tiết"
                                className="p-button-success"
                                onClick={saveDetail}
                            />
                        )}
                    </div>
                </div>

                <DataTable value={details} responsiveLayout="scroll">
                    <Column header="STT" body={(rowData, { rowIndex }) => rowIndex + 1} />
                    <Column field="detail_key" header="Thuộc tính" />
                    <Column field="detail_value" header="Giá trị" />
                    <Column
                        header="Hành động"
                        body={(row) => (
                            <>
                                <Button
                                    icon="pi pi-pencil"
                                    className="p-button-warning mr-2"
                                    onClick={() => editDetail(row)}
                                />
                                <Button
                                    icon="pi pi-trash"
                                    className="p-button-danger"
                                    onClick={() => deleteDetail(row.detail_id)}
                                />
                            </>
                        )}
                    />
                </DataTable>
            </Dialog>

            {/* Variant Dialog */}
            <Dialog
                visible={variantDialog}
                style={{ width: '650px' }}
                header={`Size & Color - ${product.product_name}`}
                modal
                onHide={() => setVariantDialog(false)}
                footer={<Button label="Close" icon="pi pi-times" className="p-button-secondary" onClick={() => setVariantDialog(false)} />}
            >
                <div className="p-fluid mb-3">
                    <div className="p-field">
                        <Dropdown
                            value={newVariant.size}
                            options={SIZE_OPTIONS}
                            onChange={(e) => setNewVariant({ ...newVariant, size: e.value })}
                            placeholder="Chọn size"
                        />
                    </div>
                    <div className="p-field pt-2">
                        <InputText placeholder="Màu sắc" value={newVariant.color}
                            onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })} />
                    </div>
                    <div className="p-field pt-2">
                        <InputText type="number" placeholder="Số lượng" value={newVariant.stock}
                            onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })} />
                    </div>

                    <div className="p-field pt-2">
                        <label>Ảnh biến thể</label>
                        <FileUpload className="mt-2" mode="basic" accept="image/*" customUpload uploadHandler={onUploadVariant} auto chooseLabel="Tải ảnh" />
                        <InputText value={newVariant.image} onChange={(e) => setNewVariant({ ...newVariant, image: e.target.value })} placeholder="URL ảnh" className="mt-2" />
                        {newVariant.image && <img src={newVariant.image} alt="Variant" width="100" className="pt-2" />}
                    </div>

                    <div className="p-col-12 pt-2 flex gap-2">
                        {isEditingVariant ? (
                            <>
                                <Button label="Cập nhật biến thể" icon="pi pi-save" className="p-button-success" onClick={updateVariant} />
                                <Button label="Hủy chỉnh sửa" icon="pi pi-times" className="p-button-secondary"
                                    onClick={() => { setIsEditingVariant(false); setEditingVariantId(null); setNewVariant({ size: '', color: '', stock: 0, image: '' }); }}
                                />
                            </>
                        ) : (
                            <Button label="Thêm biến thể" icon="pi pi-check" className="p-button-primary" onClick={saveVariant} />
                        )}
                    </div>
                </div>

                <DataTable value={variants} responsiveLayout="scroll">
                    <Column header="STT" body={(rowData, { rowIndex }) => rowIndex + 1} />
                    <Column field="size" header="Kích cỡ" />
                    <Column field="color" header="Màu sắc" />
                    <Column field="stock" header="Kho" />
                    <Column field="image" header="Hình ảnh" body={(rowData) => <img src={rowData.image} alt="Variant" width="60" />} />
                    <Column header="Hành động"
                        body={(rowData) => (
                            <>
                                <Button icon="pi pi-pencil" className="p-button-warning mr-2" onClick={() => editVariant(rowData)} />
                                <Button icon="pi pi-trash" className="p-button-danger" onClick={() => deleteVariant(rowData.variant_id)} />
                            </>
                        )}
                    />
                </DataTable>
            </Dialog>  
        </div>
    );
};

export default ProductCRUD;
