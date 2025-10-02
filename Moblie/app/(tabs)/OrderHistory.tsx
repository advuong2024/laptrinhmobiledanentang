import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  Platform
} from "react-native";
import { TabView, TabBar,  SceneRendererProps, NavigationState } from "react-native-tab-view";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

/* --- Types --- */
type Order = {
  id: string;
  date: string;
  status: string;
  total: number;
  items: { name: string; qty: number }[];
};

type RouteType = { key: string; title: string };


type OrderStatus = "Chờ xác nhận" | "Đang vận chuyển" | "Đã giao" | "Đã hủy";

/* --- Sample data --- */
const orders: Order[] = [
  { id: "DH001", date: "2025-09-30", status: "Đã giao", total: 250000, items: [{ name: "Áo thun", qty: 2 }] },
  { id: "DH002", date: "2025-10-01", status: "Chờ xác nhận", total: 150000, items: [{ name: "Giày sneaker", qty: 1 }] },
  { id: "DH003", date: "2025-10-02", status: "Đang vận chuyển", total: 500000, items: [{ name: "Tai nghe", qty: 1 }] },
  { id: "DH004", date: "2025-10-03", status: "Đã hủy", total: 100000, items: [{ name: "Ốp điện thoại", qty: 1 }] }
];

/* --- Small components --- */
const OrderCard: React.FC<{ order: Order }> = ({ order }) => (
  <View style={styles.card}>
    <Text style={styles.orderId}>Mã đơn: {order.id}</Text>
    <Text>Ngày đặt: {order.date}</Text>
    <Text style={styles.status}>{order.status}</Text>
    <Text>Tổng tiền: {order.total.toLocaleString()} đ</Text>

    <TouchableOpacity style={styles.button}>
      <Text style={styles.buttonText}>Xem chi tiết</Text>
    </TouchableOpacity>
  </View>
);

const OrderList: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const filtered = orders.filter(o => o.status === status);

  if (filtered.length === 0) {
    return <View style={{ padding: 20 }}><Text style={{ textAlign: "center" }}>Chưa có đơn hàng</Text></View>;
  }

  return (
    <FlatList<Order>
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <OrderCard order={item} />}
    />
  );
};

/* --- Main screen --- */
const OrderHistory: React.FC = () => {
  const layout = useWindowDimensions();

  const [index, setIndex] = useState<number>(0);
  const [routes] = useState<RouteType[]>([
    { key: "pending", title: "Chờ xác nhận" },
    { key: "shipping", title: "Đang vận chuyển" },
    { key: "done", title: "Đã giao" },
    { key: "cancelled", title: "Đã hủy" },
  ]);
  const router = useRouter();

  // renderScene theo switch thay vì SceneMap để tránh một số vấn đề kiểu
  const renderScene = ({ route }: { route: RouteType }) => {
    switch (route.key) {
      case "pending":
        return <OrderList status="Chờ xác nhận" />;
      case "shipping":
        return <OrderList status="Đang vận chuyển" />;
      case "done":
        return <OrderList status="Đã giao" />;
      case "cancelled":
        return <OrderList status="Đã hủy" />;
      default:
        return null;
    }
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push({ pathname: '/' })}>
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
            renderLabel={({ route, focused, color }: {route: RouteType; focused: boolean; color: string }) => (
              <Text
                style={{
                  fontWeight: "600",
                }}
              >
                {route.title}
              </Text>
            )}
          />
        )}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
      paddingTop: Platform.OS === 'ios' ? 35 : 40,
    },
    backButton: { flexDirection: 'row', alignItems: 'center' },
    backButtonText: { marginLeft: 5, fontSize: 16, color: '#0a87ecff' },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  orderId: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  status: {
    marginVertical: 4,
    fontStyle: "italic",
    color: "#ff5722",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#007bff",
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});

export default OrderHistory;
