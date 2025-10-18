import { useCallback, useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Platform, StyleSheet, View, Text, TouchableOpacity, FlatList, Dimensions, Alert } from 'react-native';
import { ListRenderItem } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchCart, CartResponse, CartItem, deleteCart, deleteCartItem } from "@/assets/data/Carts";
import { useCart } from "@/components/CartContext"
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get('window');

export default function CartScreen() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [carts, setCarts] = useState<CartResponse | null>(null);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const { decreaseCart } = useCart();

  const increaseQty = (id: string) => {
    setQuantities(prev => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
  };
  const decreaseQty = (id: string) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      return { ...prev, [id]: current > 1 ? current - 1 : 1 };
    });
  };

  useEffect(() => {
    loadcart()
  }, []);

  const loadcart = async () => {
    try{
      const CartData = await fetchCart();
      setCarts(CartData)

      const initChecked : { [key: string]: boolean} = {};
      const initQty : { [key: string]: number} = {};
      CartData.items.forEach((item) => {
        initChecked[item.cart_item_id] = false;
        initQty[item.cart_item_id] = item.quantity;
      });
      setCheckedItems(initChecked);
      setQuantities(initQty);
    } catch(error) {
      console.error('Lỗi khi lấy giỏ hàng: ', error)
    }
  }

  const toggleCheckbox = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleAll = () => {
    if (!carts?.items) return;
    const allChecked = carts.items.every(item => checkedItems[item.cart_item_id]);
    const newChecked: { [key: string]: boolean } = {};
    carts.items.forEach(item => {
      newChecked[item.cart_item_id] = !allChecked;
    });
    setCheckedItems(newChecked);
  };

  const deleteSelected = async () => {
    if (!carts) return;
    const selected = carts.items.filter(i => checkedItems[i.cart_item_id]);
    try {
      if (selected.length === carts.items.length) {
        await deleteCart(carts.cart_id);
        Alert.alert('Thành công', 'Đã xóa toàn bộ giỏ hàng');
        setCarts(null);
        decreaseCart(carts.totalQuantity);
        setCheckedItems({});
      } else {
        for (const item of selected) await deleteCartItem(item.cart_item_id);
        const deletedQuantity = selected.reduce((sum, item) => sum + item.quantity, 0);
        decreaseCart(deletedQuantity);
        Alert.alert('Thành công', 'Đã xóa sản phẩm');
      }
      loadcart();
    } catch (error) {
      console.error(error);
    }
  }

  const handleCheckout = useCallback(async () => {
    const selected = carts?.items.filter(i => checkedItems[i.cart_item_id]);
    if (!selected || selected.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn sản phẩm để thanh toán!");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("user");

      if (!token || !user) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập");
        router.push({ pathname: "/login" });
        return;
      }

      // ✅ Cập nhật số lượng mới nhất
      const updatedItems = selected.map(item => ({
        ...item,
        quantity: quantities[item.cart_item_id] ?? item.quantity,
      }));

      // ✅ Tính lại tổng tiền theo số lượng mới
      const updatedTotalPrice = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // ✅ Lưu dữ liệu tạm vào AsyncStorage
      await AsyncStorage.setItem("checkout_items", JSON.stringify(updatedItems));
      await AsyncStorage.setItem("checkout_total", updatedTotalPrice.toString());

      // ✅ Điều hướng sang trang Checkout
      router.push({
        pathname: "/checkout",
        params: { type: "cart" },
      });
    } catch (error) {
      console.error("Lỗi khi xử lý checkout:", error);
      Alert.alert("Lỗi", "Không thể tiếp tục thanh toán");
    }
  }, [carts, checkedItems, quantities]);

  const renderCart: ListRenderItem<CartItem> = ({ item }) => (
    <View
      style={styles.productBox}
      >
      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={() => toggleCheckbox(String(item.cart_item_id))}
      >
        <View style={[styles.checkbox, checkedItems[item.cart_item_id] && styles.Checked]} />
      </TouchableOpacity>
      <Image source={item.image} style={styles.productImage} />
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/product_details', params: { id: item.product_id } })}
        >
          <Text style={styles.productName}>{item.product_name}</Text>
        </TouchableOpacity>
        <Text style={styles.productType}>màu: {item.color}, size: {item.size}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{Number(item.price).toLocaleString('vi-VN')} đ</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.qtyButton} onPress={() => decreaseQty(String(item.cart_item_id))}>
              <Text style={styles.qtyText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyNumber}>{quantities[item.cart_item_id]}</Text>
            <TouchableOpacity style={styles.qtyButton} onPress={() => increaseQty(String(item.cart_item_id))}>
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const selectedItems = carts?.items.filter((item) => checkedItems[item.cart_item_id]);
  const totalPrice = selectedItems?.reduce((sum, item) => sum + item.price * quantities[item.cart_item_id], 0) || 0;
  const totalCount = selectedItems?.length || 0;

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push({ pathname: '/' })}
        >
          <Ionicons name="arrow-back" size={24} color="#0a87ecff" />
          <Text style={styles.backButtonText}>Giỏ hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ position: 'absolute', right: 30, paddingTop: Platform.OS === 'ios' ? 35 : 40, }}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.backButtonText}>{ isEditing ? 'Xong' : 'Sửa' }</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={carts?.items || []}
        renderItem={renderCart}
        keyExtractor={item => String(item.cart_item_id)}
        contentContainerStyle={{ paddingBottom: 8 }}
      />
      <View style={styles.footer}>
        { isEditing ? (
          <>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={toggleAll}
            >
              <View style={[styles.checkbox, 
                carts?.items.every(c => checkedItems[c.cart_item_id]) && styles.Checked]} />
              <Text style={{ marginLeft: 6, position: 'relative'}}>Tất cả</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={deleteSelected}>
              <Text style={{ color: 'orange', fontWeight: 'bold' }}>
                Xoá
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={toggleAll}
            >
              <View style={[styles.checkbox, 
                carts?.items.every(c => checkedItems[c.cart_item_id]) && styles.Checked]} />
              <Text style={{ marginLeft: 6}}>Tất cả</Text>
            </TouchableOpacity>
              <View style={styles.buyContainer}>
                <Text style={styles.price}>{Number(totalPrice).toLocaleString('vi-VN')} đ</Text>
                <TouchableOpacity style={styles.buyButton} onPress={handleCheckout}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    Mua hàng ({totalCount})
                  </Text>
                </TouchableOpacity>
              </View>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'ios' ? 35 : 40,
    backgroundColor: '#fff'
  },
  backButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#0a87ecff',
  },
  Title: {
    fontSize: 18,
    marginTop: 10,
    marginStart: 15,
    fontWeight: 'bold',
  },
  productBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 6,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 10,
    marginLeft: 10,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },

  productType: {
    fontSize: 13,
    color: '#0a87ecff',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
  },

  productPrice: {
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },

  qtyButton: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },

  qtyText: {
    fontSize: 16,
    color: '#333',
  },

  qtyNumber: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#333',
  },
  footer: {
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
    marginBottom: 10
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 4,
  },
  Checked: {
    backgroundColor: "#0a87ecff",
  },
  buyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    marginRight: 10,
    fontWeight: "bold",
    color: "red",
  },
  buyButton: {
    backgroundColor: "orange",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: "orange",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
});