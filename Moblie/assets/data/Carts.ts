// services/cartApi.ts
import { getGuestId } from "../services/guestService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.1.95:8080"; // ở nhà
// const BASE_URL = "http://172.20.10.3:8080";
// const BASE_URL = 'http://192.168.137.204:8080';
// const BASE_URL = "http://192.168.92.23:8080";

export interface CartItem {
  cart_item_id: number;
  quantity: number;
  variant_id: number;
  color: string;
  size: string;
  product_id: string;
  image: string;
  product_name: string;
  price: number;
}

export interface CartResponse {
  cart_id: number;
  totalQuantity: number;
  items: CartItem[];
}

export const fetchCart = async (): Promise<CartResponse> => {
  const token = await AsyncStorage.getItem("token");
  let url = `${BASE_URL}/carts/getcart`;

  if (token) {
    // đã đăng nhập -> lấy customer_id từ user trong AsyncStorage
    const userStr = await AsyncStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      url += `?customer_id=${user.customer_id}`;
    }
  } else {
    // chưa đăng nhập -> dùng guestId
    const guestId = await getGuestId();
    url += `?guest_id=${guestId}`;
  }

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (!res.ok) throw new Error("Lỗi khi lấy giỏ hàng");
  return res.json();
};

export const addToCart = async (
  variantId: number,
  quantity: number
): Promise<CartResponse> => {
  const token = await AsyncStorage.getItem("token");
  let customerId: number | null = null;
  const guestId = await getGuestId();

  if (token) {
    // lấy user từ AsyncStorage hoặc gọi API /auth/me
    const userStr = await AsyncStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      customerId = user.customer_id;
    }
  }

  const res = await fetch(`${BASE_URL}/carts/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      customer_id: customerId,
      guest_id: customerId ? null : guestId, // nếu có customer thì bỏ guestId
      variant_id: variantId,
      quantity,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API lỗi: ${res.status} - ${errorText}`);
  }

  return res.json();
};

export const deleteCartItem = async (cart_item_id: number) => {
  const res = await fetch(`${BASE_URL}/cart_items/${cart_item_id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Xóa item thất bại');
  return res.json();
};

export const deleteCart = async (cart_id: number) => {
  const res = await fetch(`${BASE_URL}/carts/${cart_id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Xóa giỏ hàng thất bại');
  return res.json();
};