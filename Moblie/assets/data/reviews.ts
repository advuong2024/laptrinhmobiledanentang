const BASE_URL = "http://192.168.1.248:8080"; // ở nhà
// const BASE_URL = "http://172.20.10.3:8080";
// const BASE_URL = 'http://192.168.137.204:8080';
// const BASE_URL = "http://192.168.92.23:8080";


export interface Reviews {
  review_id: number;
  product_id: string;
  fullname: string;
  rating: number; 
  comment: string;
  created_at: string;
}

export interface ReviewStats {
    product_id: string;
    avg_rating: number; 
    total_review: number; 
}

export const fetchProductView = async (id: string): Promise<Reviews[]> => {
  const res = await fetch(`${BASE_URL}/reviews/productid/${id}`);
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Lỗi API khi lấy đánh giá: ${res.status} - ${errorText}`);
  }
  
  return res.json();
};

export const fetchReviewStats = async (id: string): Promise<ReviewStats[]> => {
  const res = await fetch(`${BASE_URL}/reviews/reviewstats/${id}`);
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Lỗi API khi lấy thống kê đánh giá: ${res.status} - ${errorText}`);
  }
  
  // API của bạn trả về mảng, nên giữ nguyên Promise<ReviewStats[]>
  return res.json();
};