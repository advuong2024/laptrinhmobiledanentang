// URL base của API
const BASE_URL = "http://192.168.1.248:8080"; // ở nhà
// const BASE_URL = 'http://10.155.110.23:8080';
// const BASE_URL = "http://172.20.10.3:8080";
// const BASE_URL = "http://192.168.92.23:8080";

// 🧩 Định nghĩa kiểu dữ liệu gửi lên
export interface RegisterData {
  fullname: string;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  username: string;
  password: string;
}

// 🧩 Định nghĩa kiểu dữ liệu trả về
export interface RegisterResponse {
  message: string;
  customer: {
    customer_id: number;
    fullname: string;
    gender: string;
    phone?: string;
    email?: string;
    address?: string;
    avatar?: string | null;
  };
  account: {
    user_id: number;
    username: string;
    password: string;
    role: string;
    customer_id: number;
  };
}

// 🧠 Hàm gọi API đăng ký
export const registerUser = async (
  userData: RegisterData
): Promise<RegisterResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Lỗi server");
    }

    return data as RegisterResponse;
  } catch (error: any) {
    console.error("❌ Lỗi khi gọi API đăng ký:", error);
    throw new Error(error.message || "Không thể kết nối tới máy chủ");
  }
};
