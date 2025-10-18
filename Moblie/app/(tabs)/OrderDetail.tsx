import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import OrderService, {OrderDetailData as OrderDetailData} from "@/assets/data/order";
import { Ionicons } from '@expo/vector-icons';

const OrderDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error("Thiếu order_id!");

        const response = await OrderService.detailOrder(Number(id));
        setOrder(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading)
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007bff" />;

  if (error)
    return <Text style={styles.errorText}>Lỗi: {error}</Text>;

  if (!order)
    return <Text style={styles.errorText}>Không tìm thấy chi tiết đơn hàng.</Text>;

  const displayDate = order.last_update
    ? new Date(order.last_update).toLocaleString("vi-VN")
    : new Date(order.order_date).toLocaleString("vi-VN");

  return (
    <>
         <View style={styles.headertitle}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push({ pathname: '/OrderHistory' })}>
                <Ionicons name="arrow-back" size={24} color="#0a87ecff" />
                <Text style={styles.backButtonText}>Chi tiết đơn hàng</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.container}>
            <Text style={styles.header}>Chi tiết đơn hàng #{order.order_id}</Text>

            <View style={styles.card}>
                <Text style={styles.label}>
                  Trạng thái: <Text style={styles.status}>{order.status}</Text>
                </Text>
                <Text>
                  Cập nhật gần nhất: <Text style={styles.value}>{displayDate}</Text>
                </Text>
                <Text>
                  Địa chỉ giao hàng:{" "}
                  <Text style={styles.value}>{order.shipping_address}</Text>
                </Text>
                <Text>
                Tổng tiền:{" "}
                  <Text style={styles.total}>
                    {Number(order.total).toLocaleString("vi-VN")} ₫
                  </Text>
                </Text>
            </View>

            <Text style={styles.subHeader}>Sản phẩm trong đơn</Text>

            <FlatList
              data={order.items}
              keyExtractor={(item) => item.variant_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.itemCard} onPress={() => router.push({ pathname: '/product_details', params: { id: item.product_id } })}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemVariant}>
                      Màu: {item.color} | Size: {item.size}
                    </Text>
                    <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
                    <Text style={styles.itemPrice}>
                      Giá: {Number(item.price).toLocaleString("vi-VN")} ₫
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            
        </View>
    </>
  );
};

export default OrderDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
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
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#f8f9fa",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
  value: {
    fontWeight: "500",
    color: "#333",
  },
  status: {
    color: "#007bff",
    fontWeight: "bold",
  },
  total: {
    color: "#e53935",
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#f1f3f5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  itemVariant: {
    color: "#555",
    fontSize: 14,
  },
  itemQuantity: {
    fontSize: 14,
  },
  itemPrice: {
    color: "#e53935",
    fontWeight: "600",
    marginTop: 4,
  },
  backBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  backText: {
    color: "#fff",
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});
