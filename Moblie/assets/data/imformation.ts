import AsyncStorage from "@react-native-async-storage/async-storage";
// URL base của API
const BASE_URL = "http://192.168.1.248:8080"; // ở nhà
// const BASE_URL = 'http://10.155.110.23:8080';
// const BASE_URL = "http://172.20.10.3:8080";
// const BASE_URL = "http://192.168.92.23:8080";


export interface Customer {
    customer_id: string,
    fullname: string,
    phone: string,
    email: string,
    address: string,
    gender: string,
    avatar: string
}

export const fetchCustomerid = async (id: string): Promise<Customer[]> => {
  const res = await fetch(`${BASE_URL}/customers/${id}`);
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Lỗi API khi lấy thông tin người dùng: ${res.status} - ${errorText}`);
  }

  return res.json(); 
};

export const UpdateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => {
  const res = await fetch(`${BASE_URL}/customers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Cập nhật khách hàng thất bại");

  return res.json();
};

export const updateAvatarBackend = async (customerId: string, avatarUrl: string) => {
  const res = await fetch(`${BASE_URL}/customers/${customerId}/avatar`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ avatar: avatarUrl }),
  });

  if (!res.ok) throw new Error("Lỗi cập nhật avatar");

  return res.json();
};

export interface CustomerStats {
  customer_id: number;
  fullname: string;
  tong_chi_tieu: number;
  tong_don_hang: number;
  hang_thanh_vien: string;
}

// Hàm lấy thống kê khách hàng
export const fetchCustomerStats = async (): Promise<CustomerStats> => {
  const userStr = await AsyncStorage.getItem("user");
  if (!userStr) throw new Error("Chưa đăng nhập");

  const user = JSON.parse(userStr);
  const customerId = user.customer_id;

  const res = await fetch(`${BASE_URL}/customers/${customerId}/stats`);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API lỗi: ${res.status} - ${errorText}`);
  }

  return res.json();
};


export const changePassword = async (userId: number, oldPassword: string, newPassword: string) => {
  const response = await fetch(`${BASE_URL}/user_accounts/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId, oldPassword, newPassword }),
  });

  if (!response.ok) {
    throw new Error(`API Error ${response.status}`);
  }

  return await response.json();
};

