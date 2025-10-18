import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ProductService } from '../../../demo/service/ProductService';

const Crud = () => {
    let emptyProduct = {
        product_id: null,
        category_id: null,
        product_name: '',
        description: '',
        price: 0,
        stock: 0,
        image_url: '',
        inventoryStatus: 'INSTOCK'
    };

    const [products, setProducts] = useState([]);
    const [productDialog, setProductDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [product, setProduct] = useState(emptyProduct);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        ProductService.getProducts().then((data) => setProducts(data));
    }, []);

    const openNew = () => {
        setProduct(emptyProduct);
        setSubmitted(false);
        setProductDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
    };

    const saveProduct = () => {
        setSubmitted(true);
        if (product.product_name.trim()) {
            let _products = [...products];
            let _product = { ...product };

            if (product.product_id) {
                const index = _products.findIndex(p => p.product_id === product.product_id);
                _products[index] = _product;
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Product Updated', life: 3000 });
            } else {
                _product.product_id = createId();
                _products.push(_product);
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Product Created', life: 3000 });
            }

            setProducts(_products);
            setProductDialog(false);
            setProduct(emptyProduct);
        }
    };

    const editProduct = (prod) => {
        setProduct({ ...prod });
        setProductDialog(true);
    };

    const confirmDeleteProduct = (prod) => {
        setProduct(prod);
        setDeleteProductDialog(true);
    };

    const deleteProduct = () => {
        let _products = products.filter(val => val.product_id !== product.product_id);
        setProducts(_products);
        setDeleteProductDialog(false);
        setProduct(emptyProduct);
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Product Deleted', life: 3000 });
    };

    const createId = () => {
        return Math.floor(Math.random() * 100000).toString();
    };

    const onInputChange = (e, name) => {
        const val = e.target.value;
        setProduct(prevState => ({ ...prevState, [name]: val }));
    };

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        setProduct(prevState => ({ ...prevState, [name]: val }));
    };

    const onFileUpload = (event) => {
        setProduct(prevState => ({ ...prevState, image_url: event.files[0].objectURL }));
    };

    const header = (
        <div className="flex justify-content-between">
            <h5 className="m-0">Manage Products</h5>
            <InputText type="search" onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
        </div>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={() => (
                        <Button label="New" icon="pi pi-plus" onClick={openNew} />
                    )} />

                    <DataTable
                        ref={dt}
                        value={products}
                        selection={selectedProducts}
                        onSelectionChange={(e) => setSelectedProducts(e.value)}
                        dataKey="product_id"
                        paginator rows={10}
                        emptyMessage="No products found."
                        header={header}
                    >
                        <Column field="product_name" header="Name" sortable></Column>
                        <Column field="description" header="Description"></Column>
                        <Column field="price" header="Price" sortable></Column>
                        <Column field="stock" header="Stock" sortable></Column>
                        <Column field="inventoryStatus" header="Status" sortable></Column>
                        <Column field="image_url" header="Image" body={(rowData) => (
                            <img src={rowData.image_url} alt={rowData.product_name} width="50" />
                        )} />
                        <Column body={(rowData) => (
                            <>
                                <Button icon="pi pi-pencil" className="mr-2" onClick={() => editProduct(rowData)} />
                                <Button icon="pi pi-trash" className="p-button-danger" onClick={() => confirmDeleteProduct(rowData)} />
                            </>
                        )} />
                    </DataTable>

                    <Dialog visible={productDialog} style={{ width: '450px' }} header="Product Details" modal onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="product_name">Name</label>
                            <InputText id="product_name" value={product.product_name} onChange={(e) => onInputChange(e, 'product_name')} required autoFocus />
                        </div>
                        <FileUpload mode="basic" accept="image/*" customUpload onSelect={onFileUpload} />
                        <Button label="Save" icon="pi pi-check" onClick={saveProduct} />
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Crud;
