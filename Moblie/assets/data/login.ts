import AsyncStorage from "@react-native-async-storage/async-storage";
import { getGuestId } from "@/assets/services/guestService"; 

const BASE_URL = "http://192.168.1.95:8080"; // ở nhà
// const BASE_URL = "http://172.20.10.3:8080";
// const BASE_URL = 'http://192.168.137.204:8080';
// const BASE_URL = "http://192.168.92.23:8080";


export interface UserInfo {
  id_user: number;
  taikhoan: string;
  customer_id: number | null;
  quyen: string;
}

export interface UserResponse {
  message: string;
  token: string;
  user: UserInfo;
}

export const login = async (
  username: string,
  password: string
): Promise<UserResponse> => {
  const guestId = await getGuestId();

  const url = `${BASE_URL}/auth/login`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        taikhoan: username,
        matkhau: password,
        guest_id: guestId,
      }),
    });

    if (!res.ok) {
      // 🔹 Xử lý lỗi khi đăng nhập thất bại
      const errorBody = await res.json();

      if (res.status === 401 || res.status === 400) {
        // Sai tài khoản hoặc mật khẩu
        throw new Error(errorBody || "Tài khoản hoặc mật khẩu không đúng!");
      }

      throw new Error("Đăng nhập thất bại, vui lòng thử lại.");
    }

    const data: UserResponse = await res.json();

    // ✅ Lưu token và user vào AsyncStorage
    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));

    return data;
  } catch (err: any) {
    // 🔹 Nếu có lỗi mạng hoặc backend không phản hồi
    throw new Error(err.message || "Có lỗi xảy ra, vui lòng thử lại sau.");
  }
};

