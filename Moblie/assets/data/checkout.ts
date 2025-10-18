import AsyncStorage from "@react-native-async-storage/async-storage";
import { getGuestId } from "../services/guestService";

const BASE_URL = "http://192.168.1.248:8080"; // ở nhà
// const BASE_URL = 'http://10.155.110.23:8080';
// const BASE_URL = "http://172.20.10.3:8080";
// const BASE_URL = "http://192.168.92.23:8080";


//checkout sản phẩm
export interface Checkouts {
    variant_id: string,
    product_name: string,
    price:  number,
    color: string,
    size: string,
    stock: number,
    image: string,
    quantity: number;
}

export interface CustomerChecks {
  customer_id: string;
  fullname: string;
  phone: string;
  address: string;
}

const fetchCustomer = async () => {
  try {
    const userData = await AsyncStorage.getItem("user");
    if (!userData) {
      console.log("⚠️ Không có user trong AsyncStorage");
      return null;
    }
    const parsed = JSON.parse(userData);
    const customer_id = parsed.id || parsed.customer_id || parsed.user_id;
    if (!customer_id) {
      return null;
    }
    const res = await fetch(`${BASE_URL}/customers/${customer_id}`);
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  } catch (err) {
    console.error("❌ Lỗi fetchCustomer:", err);
    return null;
  }
};


// Hàm gộp chung
import { useApi } from './useApi'; // import hook useApi

export const useFetchCheckout = () => {
  const { callApi } = useApi();

  const fetchCheckout = async (type: "buyNow" | "cart", id?: string) => {
    try {
      // Lấy thông tin khách hàng, nếu có token
      const customer = await fetchCustomer();

      if (type === "buyNow" && id) {
        const productData = await callApi(`${BASE_URL}/product_variants/variantid/${id}`);
        const product = Array.isArray(productData) ? productData[0] : productData;
        return { type, product, customer };
      }

      if (type === "cart") {
        const userData = await AsyncStorage.getItem("user");
        const guestId = await AsyncStorage.getItem("guest_id");
        let query = "";

        if (userData) {
          const parsed = JSON.parse(userData);
          const customer_id = parsed.id || parsed.customer_id || parsed.user_id;
          if (customer_id) query = `customer_id=${customer_id}`;
        } else if (guestId) {
          query = `guest_id=${guestId}`;
        }

        const cartItems = await callApi(`${BASE_URL}/carts/getcart?${query}`) || [];
        return { type, cartItems, customer };
      }

      return { type, product: null, cartItems: [], customer };
    } catch (err) {
      console.error("Lỗi fetchCheckout:", err);
      return { type, product: null, cartItems: [], customer: null };
    }
  };

  return { fetchCheckout };
};

//Đặt đơn hàng
export interface OrderItem {
  variant_id: number;
  quantity: number;
  price: number;
}

export interface PlaceOrderPayload {
  customer_id: string;
  shipping_address: string;
  items: OrderItem[];
  payment_method: string;
}

export const placeOrder = async (orderData: PlaceOrderPayload) => {
  try {
    const response = await fetch(`${BASE_URL}/orders/checkouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Đặt hàng thất bại");
    }

    return data;
  } catch (error: any) {
    console.error("API placeOrder error:", error);
    throw error;
  }
};

export const removeOrderedItems = async (
  customer_id: number,
  variantIds: number[]
): Promise<{ message: string }> => {
  if (!variantIds.length) {
    throw new Error("Danh sách sản phẩm trống");
  }

  const res = await fetch(
    `${BASE_URL}/carts/remove-ordered-items/${customer_id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ variant_ids: variantIds }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Lỗi khi xóa sản phẩm trong giỏ: ${errorText}`);
  }

  return res.json();
};