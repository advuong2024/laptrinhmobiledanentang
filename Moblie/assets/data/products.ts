export type Product = {
  product_id: string;
  product_name: string;
  description: string;
  price: number;
  image: string;
  category_id: string;
};

export type Category = {
  category_id: string;
  category_name: string;
  category_image: string;
};

// URL base của API
const BASE_URL = "http://192.168.1.95:8080"; // ở nhà
// const BASE_URL = "http://172.20.10.3:8080";
// const BASE_URL = 'http://192.168.137.204:8080';
// const BASE_URL = "http://192.168.92.23:8080";


// Hàm lấy sản phẩm
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${BASE_URL}/products`);
    const text = await response.text();
    if (!response.ok) throw new Error('Lỗi khi load sản phẩm');
    return JSON.parse(text);
  } catch (error) {
    console.error(error);
    return []; // trả về mảng rỗng khi lỗi
  }
};

// Hàm lấy danh mục
export const fetchCategorys = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${BASE_URL}/categorys`);
    const text = await response.text();
    if (!response.ok) throw new Error('Lỗi khi load loại sản phẩm');
    return JSON.parse(text);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchProductid = async (id: string): Promise<Product[]> => {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Lỗi API khi lấy sản phẩm: ${res.status} - ${errorText}`);
  }

  return res.json(); 
};