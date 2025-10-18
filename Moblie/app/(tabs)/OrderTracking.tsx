import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import OrderService, {OrderTracking as OrderTracking} from "@/assets/data/order";
import { Ionicons } from '@expo/vector-icons';

const OrderTrackingScreen = () => {
  const { id } = useLocalSearchParams(); // Lấy id từ route
  const router = useRouter();

  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error("Thiếu order_id!");

        // Gọi API qua OrderService
        const res = await OrderService.trackOrder(Number(id));
        setOrder(res.data);
      } catch (err: any) {
        setError(err.message || "Không thể tải đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // ---- Xử lý trạng thái hiển thị ----
  if (loading)
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007bff" />;

  if (error)
    return <Text style={styles.errorText}>Lỗi: {error}</Text>;

  if (!order)
    return (
      <Text style={{ textAlign: "center", marginTop: 20 }}>
        Không tìm thấy dữ liệu đơn hàng.
      </Text>
    );

  return (
    <>
        <View style={styles.headertitle}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push({ pathname: '/OrderHistory' })}>
                <Ionicons name="arrow-back" size={24} color="#0a87ecff" />
                <Text style={styles.backButtonText}>{order.current_status}</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.container}>
            <Text style={styles.header}>Theo dõi đơn hàng #{order.order_id}</Text>

            <View style={styles.card}>
                <Text style={styles.label}>
                    Trạng thái hiện tại:{" "}
                    <Text style={styles.status}>{order.current_status}</Text>
                </Text>
                <Text>
                    Ngày đặt: {new Date(order.order_date).toLocaleString("vi-VN")}
                </Text>
            </View>

            <Text style={styles.subHeader}>Lịch sử đơn hàng</Text>

            {order.tracking_history && order.tracking_history.length > 0 ? (
                <FlatList
                data={order.tracking_history}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.timelineItem}>
                    <View
                        style={[
                        styles.circle,
                        index === order.tracking_history.length - 1 &&
                            styles.activeCircle,
                        ]}
                    />
                    <View style={styles.timelineContent}>
                        <Text style={styles.timelineStatus}>
                        {item.status || "Chưa có cập nhật"}
                        </Text>
                        {item.note && (
                        <Text style={styles.timelineNote}>{item.note}</Text>
                        )}
                        {item.updated_at && (
                        <Text style={styles.timelineTime}>
                            {new Date(item.updated_at).toLocaleString("vi-VN")}
                        </Text>
                        )}
                    </View>
                  </View>
                )}
                />
            ) : (
                <Text style={{ textAlign: "center", color: "#888" }}>
                Chưa có cập nhật trạng thái nào.
                </Text>
            )}
        </View>
    </>
  );
};

export default OrderTrackingScreen;

// ---- CSS ----
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  headertitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'ios' ? 35 : 40,
  },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backButtonText: { marginLeft: 5, fontSize: 16, color: '#0a87ecff' },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  card: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  label: { fontWeight: "600", marginBottom: 4 },
  status: { color: "#007bff", fontWeight: "bold" },
  subHeader: { fontSize: 18, fontWeight: "600", marginVertical: 10 },
  timelineItem: { flexDirection: "row", marginBottom: 16 },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ccc",
    marginRight: 10,
    marginTop: 6,
  },
  activeCircle: { backgroundColor: "#007bff" },
  timelineContent: { flex: 1 },
  timelineStatus: { fontWeight: "bold", fontSize: 16 },
  timelineNote: { color: "#555", fontSize: 14 },
  timelineTime: { color: "#888", fontSize: 12 },
  backBtn: {
    marginTop: 20,
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  backText: { color: "#fff", fontWeight: "600" },
  errorText: { color: "red", textAlign: "center", marginTop: 20 },
});
