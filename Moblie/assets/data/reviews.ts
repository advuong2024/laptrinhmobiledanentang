const BASE_URL = "http://192.168.1.248:8080"; // ở nhà
// const BASE_URL = 'http://10.155.110.23:8080';
// const BASE_URL = "http://172.20.10.3:8080";
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

  const json = await res.json();

  // ✅ Chỉ trả về mảng data
  if (json.success && Array.isArray(json.data)) {
    return json.data;
  }

  // Nếu không có data thì trả mảng rỗng
  return [];
};

export const fetchReviewStats = async (id: string): Promise<ReviewStats[]> => {
  const res = await fetch(`${BASE_URL}/reviews/reviewstats/${id}`);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Lỗi API khi lấy thống kê đánh giá: ${res.status} - ${errorText}`);
  }

  const json = await res.json();

  // ✅ Lấy đúng mảng data từ API
  return Array.isArray(json.data) ? json.data : [];
};

export const submitReview = async (reviewData: {
  product_id: number;
  customer_id: number;
  rating: number;
  comment: string;
  order_id: number;
}) => {
  try {
    const res = await fetch(`${BASE_URL}/reviews/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Lỗi API khi thêm đánh giá: ${res.status} - ${errorText}`);
    }

    return await res.json(); // Trả về kết quả từ backend
  } catch (err) {
    console.error("Lỗi submitReview:", err);
    throw err;
  }
};

export const checkReviewedByOrder = async (
  order_id: number,
  product_id: number,
  customer_id: number
): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}/reviews/checkReviewed/${order_id}/${product_id}/${customer_id}`);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Lỗi API khi kiểm tra đánh giá: ${res.status} - ${errorText}`);
    }

    const json = await res.json();
    return json.success ? json.hasReviewed : false; // ✅ trả về true/false
  } catch (err) {
    console.error("Lỗi checkReviewedByOrder:", err);
    return false;
  }
};