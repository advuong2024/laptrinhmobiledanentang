import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import axios from "axios";

const CLOUDINARY_SIGN_URL = "http://localhost:8080/upload/sign";

const UserCRUD = () => {
    const [users, setUsers] = useState([]);
    const [userDialog, setUserDialog] = useState(false);
    const [user, setUser] = useState({
        fullname: "",
        phone: "",
        email: "",
        address: "",
        gender: "",
        avatar: "",
        username: "",
        password: "",
        role: "customer"
    });
    const toast = useRef(null);

    const GENDER_OPTIONS = [
        { label: "Nam", value: "Nam" },
        { label: "Nữ", value: "Nữ" },
        { label: "Khác", value: "Khác" },
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:8080/customers");
            setUsers(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách khách hàng:", error);
        }
    };

    const openNew = () => {
        setUser({
            fullname: "",
            phone: "",
            email: "",
            address: "",
            gender: "",
            avatar: "",
            username: "",
            password: "",
            role: "customer"
        });
        setUserDialog(true);
    };

    const hideDialog = () => setUserDialog(false);

    // 🟢 Upload ảnh Cloudinary
    const onUpload = async (event) => {
        const file = event.files[0];
        if (!file) return;

        try {
            const signResponse = await axios.get(CLOUDINARY_SIGN_URL);
            const { timestamp, signature, api_key, cloud_name } = signResponse.data;

            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", api_key);
            formData.append("timestamp", timestamp);
            formData.append("signature", signature);
            formData.append("folder", "customer_avatar");

            const uploadResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
                formData
            );

            const imageUrl = uploadResponse.data.secure_url;
            setUser({ ...user, avatar: imageUrl });

            toast.current.show({
                severity: "success",
                summary: "Thành công",
                detail: "Ảnh đã được tải lên",
                life: 3000,
            });
        } catch (error) {
            console.error("Upload lỗi:", error);
            toast.current.show({
                severity: "error",
                summary: "Lỗi upload",
                detail: "Không thể tải ảnh lên Cloudinary",
                life: 3000,
            });
        }
    };

    // 🟢 Lưu khách hàng + tài khoản
    const saveUser = async () => {
        try {
            // 1️⃣ Thêm khách hàng
            const customerRes = await axios.post("http://localhost:8080/customers", {
                fullname: user.fullname,
                phone: user.phone,
                email: user.email,
                address: user.address,
                gender: user.gender,
                avatar: user.avatar,
            });

            const customerId = customerRes.data.customer_id;

            // 2️⃣ Thêm tài khoản liên kết
            await axios.post("http://localhost:8080/user_accounts", {
                username: user.username,
                password: user.password,
                role: user.role,
                customer_id: customerId,
            });

            toast.current.show({
                severity: "success",
                summary: "Thành công",
                detail: "Thêm khách hàng thành công",
                life: 3000,
            });

            fetchUsers();
            setUserDialog(false);
        } catch (error) {
            console.error("Lỗi khi lưu khách hàng:", error);
            toast.current.show({
                severity: "error",
                summary: "Lỗi",
                detail: "Không thể thêm khách hàng",
                life: 3000,
            });
        }
    };

    const deleteUser = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/customers/${id}`);
            fetchUsers();
            toast.current.show({
                severity: "warn",
                summary: "Đã xóa",
                detail: "Xóa khách hàng thành công",
                life: 3000,
            });
        } catch (error) {
            console.error("Lỗi xóa khách hàng:", error);
        }
    };

    return (
        <div className="p-4">
            <Toast ref={toast} />
            <h2 className="mb-3">Quản lý khách hàng</h2>

            <Button
                label="Thêm khách hàng"
                icon="pi pi-plus"
                className="p-button-success mb-3"
                onClick={openNew}
            />

            <DataTable value={users} responsiveLayout="scroll">
                <Column header="STT" body={(rowData, options) => options.rowIndex + 1} />
                <Column field="fullname" header="Họ và tên" />
                <Column field="gender" header="Giới tính" />
                <Column field="email" header="Email" />
                <Column field="address" header="Địa chỉ" />
                <Column field="phone" header="Số điện thoại" />
                <Column
                    field="avatar"
                    header="Ảnh đại diện"
                    body={(rowData) =>
                        rowData.avatar ? (
                            <img
                                src={rowData.avatar}
                                alt={rowData.fullname}
                                width="50"
                                className="border-round"
                            />
                        ) : (
                            "Không có ảnh"
                        )
                    }
                />
                <Column
                    header="Hành động"
                    body={(rowData) => (
                        <Button
                            icon="pi pi-trash"
                            className="p-button-danger"
                            onClick={() => deleteUser(rowData.customer_id)}
                        />
                    )}
                />
            </DataTable>

            {/* 🟢 Dialog thêm khách hàng */}
            <Dialog
                visible={userDialog}
                style={{ width: "500px" }}
                header="Thêm khách hàng"
                modal
                onHide={hideDialog}
                footer={
                    <>
                        <Button
                            label="Hủy"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={hideDialog}
                        />
                        <Button
                            label="Lưu"
                            icon="pi pi-check"
                            className="p-button-primary"
                            onClick={saveUser}
                        />
                    </>
                }
            >
                <div className="p-fluid">
                    <div className="p-field">
                        <label>Họ và tên</label>
                        <InputText
                            value={user.fullname}
                            onChange={(e) => setUser({ ...user, fullname: e.target.value })}
                        />
                    </div>

                    <div className="p-field">
                        <label>Giới tính</label>
                        <Dropdown
                            value={user.gender}
                            options={GENDER_OPTIONS}
                            onChange={(e) => setUser({ ...user, gender: e.value })}
                            placeholder="Chọn giới tính"
                        />
                    </div>

                    <div className="p-field">
                        <label>Email</label>
                        <InputText
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                        />
                    </div>

                    <div className="p-field">
                        <label>Địa chỉ</label>
                        <InputText
                            value={user.address}
                            onChange={(e) => setUser({ ...user, address: e.target.value })}
                        />
                    </div>

                    <div className="p-field">
                        <label>Số điện thoại</label>
                        <InputText
                            value={user.phone}
                            onChange={(e) => setUser({ ...user, phone: e.target.value })}
                        />
                    </div>

                    <div className="p-field">
                        <label>Tài khoản đăng nhập</label>
                        <InputText
                            value={user.username}
                            onChange={(e) => setUser({ ...user, username: e.target.value })}
                        />
                    </div>

                    <div className="p-field">
                        <label>Mật khẩu</label>
                        <InputText
                            type="password"
                            value={user.password}
                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                        />
                    </div>

                    <div className="p-field">
                        <label>Tải lên ảnh đại diện</label>
                        <FileUpload
                            mode="basic"
                            className="mt-2"
                            accept="image/*"
                            customUpload
                            uploadHandler={onUpload}
                            auto
                            chooseLabel="Chọn ảnh"
                        />
                        {user.avatar && (
                            <img src={user.avatar} alt="avatar" width="100" className="mt-3" />
                        )}
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default UserCRUD;
