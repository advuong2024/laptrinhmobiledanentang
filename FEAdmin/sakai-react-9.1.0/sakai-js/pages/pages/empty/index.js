import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import axios from 'axios';

const ProductCRUD = () => {
    const [products, setProducts] = useState([]);
    const [productDialog, setProductDialog] = useState(false);
    const [product, setProduct] = useState({ product_name: '', description: '', price: 0, stock: 0, image_url: '' });
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:3000/Products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const openNew = () => {
        setProduct({ product_name: '', description: '', price: 0, stock: 0, image_url: '' });
        setIsEdit(false);
        setProductDialog(true);
    };

    const hideDialog = () => {
        setProductDialog(false);
    };

    const saveProduct = async () => {
        try {
            if (isEdit) {
                await axios.put(`http://127.0.0.1:3000/Products/${product.product_id}`, product);
            } else {
                await axios.post('http://127.0.0.1:3000/Products', product);
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
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button label="Edit" icon="pi pi-pencil" className="p-button-warning" onClick={() => editProduct(rowData)} />
                <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={() => deleteProduct(rowData.product_id)} style={{ marginLeft: '10px' }} />
            </>
        );
    };

    return (
        <div>
            <Button label="New Product" icon="pi pi-plus" className="p-button-success" onClick={openNew} />
            <DataTable value={products} responsiveLayout="scroll">
                <Column field="product_name" header="Name"></Column>
                <Column field="description" header="Description"></Column>
                <Column field="price" header="Price"></Column>
                <Column field="stock" header="Stock"></Column>
                <Column body={actionBodyTemplate} header="Actions"></Column>
            </DataTable>

            <Dialog visible={productDialog} style={{ width: '450px' }} header="Product Details" modal className="p-fluid" footer={
                <>
                    <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
                    <Button label="Save" icon="pi pi-check" className="p-button-primary" onClick={saveProduct} />
                </>
            } onHide={hideDialog}>
                <div className="p-field">
                    <label htmlFor="product_name">Name</label>
                    <InputText id="product_name" value={product.product_name} onChange={(e) => setProduct({ ...product, product_name: e.target.value })} required autoFocus />
                </div>
                <div className="p-field">
                    <label htmlFor="description">Description</label>
                    <InputText id="description" value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} required />
                </div>
                <div className="p-field">
                    <label htmlFor="price">Price</label>
                    <InputText id="price" type="number" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} required />
                </div>
                <div className="p-field">
                    <label htmlFor="stock">Stock</label>
                    <InputText id="stock" type="number" value={product.stock} onChange={(e) => setProduct({ ...product, stock: e.target.value })} required />
                </div>
            </Dialog>
        </div>
    );
};

export default ProductCRUD;
