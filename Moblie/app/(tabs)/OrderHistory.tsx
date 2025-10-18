import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
  TextInput,
} from "react-native";
import { TabView, TabBar, NavigationState } from "react-native-tab-view";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import OrderService, { Order as ApiOrder } from "@/assets/data/order";
import { submitReview, checkReviewedByOrder } from "@/assets/data/reviews";
import AsyncStorage from "@react-native-async-storage/async-storage";

type OrderStatus =
  | "đang chờ"
  | "đã xác nhận"
  | "đang vận chuyển"
  | "đã giao"
  | "trả hàng"
  | "đã hủy";

type RouteType = { key: string; title: string };

const OrderHistory: React.FC = () => {
  const layout = useWindowDimensions();
  const router = useRouter();
  const [index, setIndex] = useState<number>(0);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // --- state đánh giá ---
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState<Record<string, boolean | undefined>>({});
  const [customerId, setCustomerId] = useState<number | null>(null);

  const [routes] = useState<RouteType[]>([
    { key: "pending", title: "Chờ xác nhận" },
    { key: "confirmed", title: "Đã xác nhận" },
    { key: "shipping", title: "Đang vận chuyển" },
    { key: "done", title: "Đã giao" },
    { key: "returngoods", title: "Trả hàng" },
    { key: "cancelled", title: "Đã hủy" },
  ]);

  // --- Lấy dữ liệu đơn hàng ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const userStr = await AsyncStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);
        setCustomerId(user.customer_id); // lưu customer_id

        const res = await OrderService.getOrders({
          customer_id: user.customer_id,
          page: 1,
          pageSize: 20,
        });
        setOrders(res);
      } catch (err) {
        console.error("Lỗi khi load đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);


  const fetchReviewStatus = async (orderId: number, productId: number) => {
    if (!customerId) return;
    const key = `${orderId}_${productId}`;
    if (reviewStatus[key] !== undefined) return; // đã check rồi

    try {
      const hasReviewed = await checkReviewedByOrder(orderId, productId, customerId);
      setReviewStatus(prev => ({ ...prev, [key]: hasReviewed }));
    } catch (err) {
      console.error("Lỗi check đánh giá:", err);
      setReviewStatus(prev => ({ ...prev, [key]: false }));
    }
  };

  // --- Hành động ---
  const handleCancel = async (id: number) => {
    try {
      await OrderService.cancelOrder(id);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "đã hủy" } : o))
      );
    } catch (err) {
      console.error("Lỗi hủy đơn:", err);
    }
  };

  const handleTrack = (orderId: number) => {
    router.push({ pathname: "/OrderTracking", params: { id: orderId.toString() } });
  };

  const handleDetailOrder = (orderId: number) => {
    router.push({ pathname: "/OrderDetail", params: { id: orderId.toString() } });
  };

  const handleReturn = async (id: number) => {
    try {
      await OrderService.returnOrder(id);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "trả hàng" } : o))
      );
    } catch (err) {
      console.error("Lỗi trả hàng:", err);
    }
  };

  // --- Mở modal đánh giá ---
  const handleReview = (product: any, orderId: number) => {
    setSelectedProduct({ ...product, orderId });
    setShowReviewModal(true);
  };

  // --- Render sao ---
  const renderStars = (currentRating: number) => (
    <View style={{ flexDirection: "row", marginVertical: 10 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)}>
          <Ionicons
            name={star <= currentRating ? "star" : "star-outline"}
            size={30}
            color="#FFD700"
            style={{ marginRight: 5 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  // --- Gửi đánh giá ---
  const handleSubmitReview = async (OrderId: number) => {
    if (!selectedProduct) return;

    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) {
        alert("Vui lòng đăng nhập để đánh giá sản phẩm!");
        return;
      }

      const user = JSON.parse(userStr);
      const customerId = user.customer_id;

      const res = await submitReview({
        product_id: selectedProduct.id,
        customer_id: customerId,
        rating,
        comment,
        order_id: OrderId,
      });

      alert(res?.message || "Gửi đánh giá thành công!");

      // Cập nhật trạng thái đánh giá
      const key = `${selectedProduct.orderId}_${selectedProduct.id}`;
      setReviewStatus((prev) => ({ ...prev, [key]: true }));

      // Reset form
      setShowReviewModal(false);
      setRating(0);
      setComment("");
    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err);
      alert("Có lỗi xảy ra khi gửi đánh giá!");
    }
  };

  // --- Render button hành động ---
  const renderActionButton = (order: ApiOrder) => {
    switch (order.status) {
      case "đang chờ":
        return (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#ff4d4f" }]}
            onPress={() => handleCancel(order.id)}
          >
            <Text style={styles.buttonText}>Hủy đơn</Text>
          </TouchableOpacity>
        );
      case "đã xác nhận":
        return (
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={[styles.button, { marginRight: 10, backgroundColor: "#1890ff" }]}
              onPress={() => handleTrack(order.id)}
            >
              <Text style={styles.buttonText}>Theo dõi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#ff4d4f" }]}
              onPress={() => handleCancel(order.id)}
            >
              <Text style={styles.buttonText}>Hủy đơn</Text>
            </TouchableOpacity>
          </View>
        );
      case "đang vận chuyển":
        return (
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={[styles.button, { marginRight: 10, backgroundColor: "#1890ff" }]}
              onPress={() => handleTrack(order.id)}
            >
              <Text style={styles.buttonText}>Theo dõi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#fa8c16" }]}
              onPress={() => handleReturn(order.id)}
            >
              <Text style={styles.buttonText}>Trả hàng</Text>
            </TouchableOpacity>
          </View>
        );
      case "đã giao":
        return (
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <TouchableOpacity
              style={[styles.button, { marginRight: 10, backgroundColor: "#fa8c16" }]}
              onPress={() => handleReturn(order.id)}
            >
              <Text style={styles.buttonText}>Trả hàng</Text>
            </TouchableOpacity>

            {order.items.map((p) => {
              const key = `${order.id}_${p.id}`;
              const reviewed = reviewStatus[key];

              // chưa check → trigger API
              if (reviewed === undefined) {
                fetchReviewStatus(order.id, p.id);
                return null; // đang chờ API
              }

              return !reviewed ? (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.button, { backgroundColor: "#52c41a" }]}
                  onPress={() => handleReview(p, order.id)}
                >
                  <Text style={styles.buttonText}>Đánh giá</Text>
                </TouchableOpacity>
              ) : (
                <Text key={p.id} style={[styles.button, { color: "#888", borderWidth: 1, borderColor: "#ccc" }]}>
                  Đã đánh giá
                </Text>
              );
            })}
          </View>
        );
      default:
        return null;
    }
  };

  // --- Render từng tab ---
  const renderScene = ({ route }: { route: RouteType }) => {
    const statusMap: Record<string, OrderStatus> = {
      pending: "đang chờ",
      confirmed: "đã xác nhận",
      shipping: "đang vận chuyển",
      done: "đã giao",
      returngoods: "trả hàng",
      cancelled: "đã hủy",
    };
    const filtered = orders.filter((o) => o.status === statusMap[route.key]);

    if (loading) {
      return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
    }

    return (
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center", margin: 20 }}>Chưa có đơn hàng</Text>
        )}
        renderItem={({ item }) => {
          const dateObj = new Date(item.date);
          const formattedDate = dateObj.toLocaleDateString("vi-VN");
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleDetailOrder(item.id)}
            >
              <View style={styles.headerRow}>
                <Text style={styles.orderDate}>Ngày: {formattedDate}</Text>
                <Text style={styles.status}>{item.status}</Text>
              </View>

              {item.items.map((p) => (
                <View key={p.id} style={styles.product}>
                  <Image source={{ uri: p.image }} style={styles.productImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{p.name}</Text>
                    <Text>Màu: {p.color}, Size: {p.size}</Text>
                    <Text>Số lượng: x {p.quantity}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.infoRow}>
                <Text style={styles.total}>
                  Tổng: {Number(item.total).toLocaleString("vi-VN")}₫
                </Text>
                <View>{renderActionButton(item)}</View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push({ pathname: "/imformation" })}
        >
          <Ionicons name="arrow-back" size={24} color="#0a87ecff" />
          <Text style={styles.backButtonText}>Đơn mua hàng</Text>
        </TouchableOpacity>
      </View>

      <TabView
        navigationState={{ index, routes } as NavigationState<RouteType>}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...(props as any)}
            scrollEnabled
            indicatorStyle={{ backgroundColor: "#fff" }}
            style={{ backgroundColor: "#0a87ecff" }}
            renderLabel={({ route }: { route: RouteType }) => (
              <Text style={{ fontWeight: "600" }}>{route.title}</Text>
            )}
          />
        )}
      />

      {/* --- Modal đánh giá --- */}
      {showReviewModal && selectedProduct && (
        <View style={styles.overlay}>
          <View style={styles.reviewBox}>
            <Text style={styles.reviewTitle}>Đánh giá sản phẩm</Text>

            <View style={styles.product}>
              <Image
                source={{ uri: selectedProduct.image }}
                style={styles.productImageLarge}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.productName}>{selectedProduct.name}</Text>
                <Text>Màu: {selectedProduct.color}</Text>
                <Text>Size: {selectedProduct.size}</Text>
              </View>
            </View>

            {renderStars(rating)}

            <TextInput
              style={styles.input}
              placeholder="Nhập bình luận của bạn..."
              value={comment}
              onChangeText={setComment}
              multiline
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#e31b1bff" }]}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#0a87ec" }]}
                onPress={() =>handleSubmitReview(selectedProduct.orderId)}
              >
                <Text style={styles.buttonText}>Gửi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

/* --- Styles --- */
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: Platform.OS === "ios" ? 35 : 40,
  },
  backButton: { flexDirection: "row", alignItems: "center" },
  backButtonText: { marginLeft: 5, fontSize: 16, color: "#0a87ecff" },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  product: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  productImage: { width: 90, height: 90, marginRight: 10, borderRadius: 4 },
  productImageLarge: { width: 100, height: 100, borderRadius: 8 },
  productName: { fontWeight: "600", fontSize: 15 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  orderDate: { fontWeight: "bold", color: "#0a87ec" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  total: { fontWeight: "bold", color: "red" },
  status: { fontStyle: "italic", color: "#ff5722" },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  reviewBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  reviewTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10, color: "#000" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: "top",
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
});

export default OrderHistory;
