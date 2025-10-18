const BASE_URL = "http://192.168.1.248:8080"; // ở nhà
// const BASE_URL = 'http://10.155.110.23:8080';
// const BASE_URL = "http://172.20.10.3:8080";
// const BASE_URL = "http://192.168.92.23:8080";

// Kiểu dữ liệu trả về từ API
export interface CategoryProduct {
  product_id: number;
  product_name: string;
  price: number;
  image: string;
  category_name: string;
}

// Hàm gọi API lấy sản phẩm theo category_id
export const fetchProductsByCategory = async (
  id: string
): Promise<CategoryProduct[]> => {
  const res = await fetch(`${BASE_URL}/categorys/categoryid/${id}`);
  if (!res.ok) throw new Error("Lỗi khi lấy sản phẩm theo category_id");
  return res.json();
};