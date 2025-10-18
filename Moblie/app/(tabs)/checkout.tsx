import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, Image, ScrollView, 
  TouchableOpacity, Alert, StyleSheet, Platform 
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useFetchCheckout, 
  Checkouts, CustomerChecks, 
  PlaceOrderPayload, placeOrder,
  removeOrderedItems
} from "../../assets/data/checkout";
import { useCart } from "@/components/CartContext";
import AsyncStorage from "@react-native-async-storage/async-storage";


const CheckoutScreen = () => {
  const { type, id, items, totalPrice, quantity, price } = useLocalSearchParams<{
    type: string,
    id?: string,
    items?: string,
    totalPrice?: string,
    quantity?: string,
    price?: string
  }>();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [product, setProduct] = useState<Checkouts | null>(null);
  const [customer, setCustomer] = useState<CustomerChecks | null>(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const { fetchCheckout } = useFetchCheckout();
  const { refreshCart } = useCart();

  const qty = quantity ? parseInt(quantity, 10) : 1;
  const router = useRouter();

  const fetchData = async () => {
    try {
      if (type === "buyNow" && id) {
        const { product, customer } = await fetchCheckout("buyNow", id);
        setProduct(product);
        setCustomer(customer);
      } else if (type === "cart") {
        // ✅ Lấy dữ liệu từ AsyncStorage
        const storedItems = await AsyncStorage.getItem("checkout_items");
        const storedTotal = await AsyncStorage.getItem("checkout_total");

        if (storedItems) {
          const parsedItems = JSON.parse(storedItems);
          setCartItems(parsedItems);
        }

        const { customer } = await fetchCheckout("cart");
        setCustomer(customer);
      }
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type, id, items]);

  // Tính tổng tiền
  const totalPriceNumber = (() => {
    if (type === "cart") {
      return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    if (type === "buyNow" && product) {
      // Nếu product là mảng, lấy phần tử đầu tiên
      const p = Array.isArray(product) ? product[0] : product;
      const priceValue = Number(p?.price || 0);
      const quantityValue = Number(quantity || p?.quantity || 1);
      return priceValue * quantityValue;
    }

    return 0;
  })();

  const finalPrice = totalPriceNumber + shippingFee;

  const handlePlaceOrder = async () => {
    if (!customer || !customer.fullname || !customer.phone || !customer.address) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin giao hàng trong tài khoản");
      return;
    }

    let itemsToOrder: PlaceOrderPayload["items"] = [];

    if (type === "cart") {
      if (!cartItems.length) {
        Alert.alert("Lỗi", "Giỏ hàng trống");
        return;
      }
      itemsToOrder = cartItems.map(item => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price
      }));
    } else if (type === "buyNow") {
      if (!product) {
        Alert.alert("Lỗi", "Sản phẩm không tồn tại");
        return;
      }
      if (!product.variant_id) {
        Alert.alert("Lỗi", "Sản phẩm chưa có biến thể (variant) để mua");
        return;
      }
      itemsToOrder = [{
        variant_id: Number(product.variant_id),
        quantity: qty,
        price: product.price
      }];
    }

    const orderData: PlaceOrderPayload = {
      customer_id: customer.customer_id,
      shipping_address: customer.address,
      items: itemsToOrder,
      payment_method: paymentMethod
    };

    try {
      const result = await placeOrder(orderData);

      const variantIds =
      type === "cart"
        ? cartItems.map((item) => item.variant_id)
        : product
        ? [Number(product.variant_id)]
        : [];

      // ✅ Gọi API xóa sản phẩm trong giỏ (chỉ sản phẩm đã đặt)
      if (customer.customer_id && variantIds.length > 0) {
        await removeOrderedItems(Number(customer.customer_id), variantIds);
        console.log("🗑️ Đã xóa sản phẩm trong giỏ hàng liên quan đến đơn hàng");
      }

      await refreshCart();

      Alert.alert("Thành công", "Đặt hàng thành công!");
      router.push("/");
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể kết nối server");
    }
  };


  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text>{item.product_name || item.name}</Text>
        <View style={{ flexDirection: 'row' }}>
          {item.color && <Text style={styles.variant}>màu: {item.color},</Text>}
          {item.size && <Text style={[styles.variant, { marginLeft: 8 }]}>size: {item.size}</Text>}
        </View>
        <Text>x {item.quantity}</Text>
      </View>
      <Text style={styles.price}>{Number(item.price).toLocaleString('vi-VN')}₫</Text>
    </View>
  );

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push({ pathname: "/" })}>
          <Ionicons name="arrow-back" size={24} color="#0a87ecff" />
          <Text style={styles.backButtonText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <ScrollView style={styles.scroll}>
          {/* Địa chỉ nhận hàng */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
            {customer ? (
              <Text>
                {customer.fullname} - {customer.phone} {"\n"} {customer.address || "Chưa có địa chỉ"}
              </Text>
            ) : (
              <Text>Vui lòng đăng nhập để thêm địa chỉ</Text>
            )}
          </View>

          {/* Danh sách sản phẩm */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sản phẩm</Text>
            {type === "buyNow" && product ? (
              renderItem({ item: product })
            ) : (
              <FlatList
                data={cartItems}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                scrollEnabled={false}
              />
            )}
          </View>

          {/* Phương thức vận chuyển */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
            <Text>Giao hàng nhanh - {shippingFee.toLocaleString()}₫</Text>
          </View>

          {/* Phương thức thanh toán */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            <View style={styles.comboRow}>
              <Picker
                selectedValue={paymentMethod}
                style={styles.picker}
                onValueChange={(itemValue) => setPaymentMethod(itemValue)}
              >
                <Picker.Item label="Thanh toán khi nhận hàng (COD)" value="COD" />
                <Picker.Item label="Chuyển khoản ngân hàng" value="chuyển khoản ngân hàng" />
                <Picker.Item label="Ví điện tử" value="ví điện tử" />
              </Picker>
            </View>
          </View>

          {/* Tổng kết đơn hàng */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tổng kết đơn hàng</Text>
            <View style={styles.row}>
              <Text>Tổng tiền hàng</Text>
              <Text>{totalPriceNumber.toLocaleString()}₫</Text>
            </View>
            <View style={styles.row}>
              <Text>Phí vận chuyển</Text>
              <Text>{shippingFee.toLocaleString()}₫</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalText}>Tổng thanh toán</Text>
              <Text style={styles.totalText}>{finalPrice.toLocaleString()}₫</Text>
            </View>
          </View>
        </ScrollView>

        {/* Nút đặt hàng */}
        <TouchableOpacity style={styles.button} onPress={handlePlaceOrder}>
          <Text style={styles.buttonText}>Đặt hàng</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15, paddingVertical: 10, paddingTop: Platform.OS === "ios" ? 35 : 40 },
  backButton: { flexDirection: "row", alignItems: "center" },
  backButtonText: { marginLeft: 5, fontSize: 16, color: "#0a87ecff" },
  container: { flex: 1, padding: 16, backgroundColor: "white" },
  scroll: { flex: 1 },
  section: { backgroundColor: "#fff", padding: 10, borderRadius: 10 },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  comboRow: { flexDirection: "row", borderWidth: 1, borderColor: '#CCC'},
  picker: { flex: 1, height: 55 },
  item: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  image: { width: 60, height: 60, borderRadius: 8 },
  variant: { color: "#888", fontSize: 12 },
  price: { fontWeight: "bold", color: "#e74c3c" },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  totalRow: { borderTopWidth: 1, borderColor: "#eee", paddingTop: 5, marginTop: 5 },
  totalText: { fontWeight: "bold", color: "#e74c3c", fontSize: 16 },
  button: { backgroundColor: "#0a87ecff", padding: 16, alignItems: "center", borderRadius: 8, marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});