import AsyncStorage from "@react-native-async-storage/async-storage";
import { getGuestId } from "@/assets/services/guestService"; 

const BASE_URL = "http://192.168.1.248:8080"; // ở nhà
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
): Promise<UserResponse | null> => {
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
      return null;
    }

    const data: UserResponse = await res.json();

    // ✅ Lưu token và user vào AsyncStorage
    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));

    return data;
  } catch (err: any) {
    console.log("Lỗi đăng nhập:", err);
    return null;
  }
};

