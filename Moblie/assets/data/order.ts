const BASE_URL = "http://192.168.1.248:8080"; // ở nhà
// const BASE_URL = 'http://10.155.110.23:8080';
// const BASE_URL = "http://172.20.10.3:8080";
// const BASE_URL = "http://192.168.92.23:8080";

export interface OrderItem {
  id: number;
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
}

export interface GetOrdersParams {
  customer_id: number;
  status?: string;
  page?: number;
  pageSize?: number;
}


export interface TrackingHistory {
  status: string;
  note: string;
  updated_at: string;
}

export interface OrderTracking {
  order_id: number;
  current_status: string;
  order_date: string;
  tracking_history: TrackingHistory[];
}

export interface OrderDetailData {
  order_id: number;
  status: string;
  order_date: string;
  total: string;
  shipping_address: string;
  last_update: string | null;
  items: {
    variant_id: number;
    product_id: number;
    name: string;
    color: string;
    size: string;
    image: string;
    quantity: number;
    price: string;
  }[];
}

const OrderService = {
  getOrders: async (params: GetOrdersParams): Promise<Order[]> => {
    const query = new URLSearchParams({
      customer_id: params.customer_id.toString(),
      status: params.status || "",
      page: (params.page || 1).toString(),
      pageSize: (params.pageSize || 10).toString(),
    }).toString();

    const res = await fetch(`${BASE_URL}/orders/getitemorder?${query}`);
    if (!res.ok) throw new Error("Lỗi khi lấy đơn hàng");
    return res.json();
  },

  cancelOrder: async (orderId: number) => {
    const res = await fetch(`${BASE_URL}/orders/cancel/${orderId}`, { method: "PUT" });
    if (!res.ok) throw new Error("Lỗi khi hủy đơn");
    return res.json();
  },

  trackOrder: async (orderId: number): Promise<{ message: string; data: OrderTracking }> => {
    const res = await fetch(`${BASE_URL}/orders/${orderId}/tracking`);
    if (!res.ok) throw new Error("Lỗi khi theo dõi đơn");
    return res.json();
  },

  detailOrder: async (orderId: number): Promise<{ message: string; data: OrderDetailData }> => {
    const res = await fetch(`${BASE_URL}/orders/${orderId}/detail`);
    if (!res.ok) throw new Error("Lỗi khi theo dõi đơn");
    return res.json();
  },

  returnOrder: async (orderId: number) => {
    const res = await fetch(`${BASE_URL}/orders/return/${orderId}`, { method: "PUT" });
    if (!res.ok) throw new Error("Lỗi khi trả hàng");
    return res.json();
  },
};

export default OrderService;
