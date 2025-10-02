const BASE_URL = "http://192.168.1.248:8080"; // ở nhà
// const BASE_URL = "http://172.20.10.3:8080";
// const BASE_URL = 'http://192.168.137.204:8080';
// const BASE_URL = "http://192.168.92.23:8080";


export interface Variants {
  variant_id: number;
  product_id: string;
  color: string;
  size: string;
  stock: number;
  image: string;
}

export interface DetailPs {
    detail_id: number;
    product_id: string;
    detail_key: string;
    detail_value: string;
}

export const fetchVariantsid = async (id: string): Promise<Variants[]> => {
  const res = await fetch(`${BASE_URL}/product_variants/productid/${id}`);
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Lỗi API khi lấy biến thể: ${res.status} - ${errorText}`);
  }
  
  return res.json();
};


export const fetchDetailsid = async (id: string): Promise<DetailPs[]> => {
  const res = await fetch(`${BASE_URL}/product_details/productid/${id}`);
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Lỗi API khi lấy chi tiết: ${res.status} - ${errorText}`);
  }
  
  return res.json();
};