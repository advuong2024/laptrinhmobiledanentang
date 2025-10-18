import { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, Platform, TextInput, 
  Alert, ScrollView, Modal 
} from "react-native";
import ImageUploader from '@/components/ImageUploader';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCart } from '@/components/CartContext';
import { Picker } from "@react-native-picker/picker";
import { 
  fetchCustomerid, Customer, 
  fetchCustomerStats, CustomerStats,
  UpdateCustomer, changePassword
} from "@/assets/data/imformation";

export default function InformationScreen() {
  const router = useRouter();
  const { cartCount, clearCart } = useCart();

  const [showProfile, setShowProfile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editing, setEditing] = useState(false);

  // ✅ Khởi tạo userInfo rỗng thay vì null
  const [userInfo, setUserInfo] = useState<Customer>({
    customer_id: "",
    fullname: "",
    phone: "",
    address: "",
    gender: "Nam",
    email: "",
    avatar: ""
  });

  const [stats, setStats] = useState<CustomerStats | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    checkLoginStatus();
    showDataCustomer();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("user");
      if (token && user) {
        setIsLoggedIn(true);
        setUserInfo(JSON.parse(user));
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra đăng nhập: ", error);
    }
  };

  const showDataCustomer = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userStr = await AsyncStorage.getItem("user");
      if (token && userStr) {
        const user = JSON.parse(userStr);
        const CustomerData = await fetchCustomerid(user.customer_id);
        setUserInfo(CustomerData[0] || userInfo);

        const data = await fetchCustomerStats();
        setStats(data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng: ", error);
    }
  };

  const handleLogout = async () => {
    try {
      if (isLoggedIn) {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        clearCart();
        router.push({ pathname: '/' });
        setIsLoggedIn(false);
      } else {
        router.push({ pathname: '/login' });
      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất: ", error);
    }
  };

  // ✅ Kiểm tra thông tin khách hàng trước khi cập nhật
  const validateCustomer = (userInfo: Customer): string | null => {
    if (!userInfo.fullname?.trim()) return "Họ và tên không được để trống";
    if (!userInfo.email?.trim()) return "Email không được để trống";
    if (!userInfo.phone?.trim()) return "Số điện thoại không được để trống";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userInfo.email)) return "Email không hợp lệ";

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(userInfo.phone)) return "Số điện thoại phải là số và có 10 hoặc 11 chữ số";

    return null;
  };

  const handleSaveProfile = async () => {
    const errorMsg = validateCustomer(userInfo);
    if (errorMsg) {
      Alert.alert("Lỗi", errorMsg);
      return;
    }

    try {
      const updated = await UpdateCustomer(String(userInfo.customer_id), {
        fullname: userInfo.fullname,
        phone: userInfo.phone,
        address: userInfo.address,
        gender: userInfo.gender,
        email: userInfo.email,
      });

      await showDataCustomer();
      setEditing(false);
      Alert.alert("Thành công", "Cập nhật thông tin khách hàng thành công!");
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật thông tin");
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPass) {
      Alert.alert("Lỗi", "Không được để trống");
      return;
    }
    if (newPassword !== confirmPass) {
      Alert.alert("Lỗi", "Mật khẩu nhập lại không khớp");
      return;
    }

    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        return;
      }
      const user = JSON.parse(userStr);

      const res = await changePassword(user.user_id, oldPassword, newPassword);
      Alert.alert("Thành công", res.message);
      setShowPasswordModal(false);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    }
  };


  const handleViewOrders = () => {
    router.push({ pathname: '/OrderHistory' });
  };

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push({ pathname: '/' })}>
          <Ionicons name="arrow-back" size={24} color="#0a87ecff" />
          <Text style={styles.backButtonText}>Trang cá nhân</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/cart' })}>
          <View style={{ position: 'relative' }}>
            <Ionicons name="cart" size={24} color="#000" style={styles.iconcart} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* Avatar */}
        <View style={styles.profileHeader}>
          <ImageUploader
            imageUrl={userInfo.avatar}
            onChangeImage={(newUrl) => setUserInfo({ ...userInfo, avatar: newUrl })}
          />
          <Text style={styles.username}>{userInfo.fullname || "Người dùng"}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsBox}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.hang_thanh_vien ?? "thành viên"}</Text>
            <Text style={styles.statLabel}>Hạng thành viên</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {stats?.tong_chi_tieu
                ? `${Number(stats.tong_chi_tieu).toLocaleString("vi-VN")}đ`
                : "0đ"}
            </Text>
            <Text style={styles.statLabel}>Tổng chi tiêu</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.tong_don_hang  ?? 0}</Text>
            <Text style={styles.statLabel}>Tổng đơn hàng</Text>
          </View>
        </View>

        {/* Thông tin cá nhân */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.cardHeader} onPress={() => setShowProfile(!showProfile)}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="person" size={20} color="#0a87ecff" style={{ marginEnd: 8 }} />
              <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
            </View>
            <Ionicons name={showProfile ? "chevron-up" : "chevron-down"} size={20} color="#0a87ecff" />
          </TouchableOpacity>

          {showProfile && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                value={userInfo.fullname}
                editable={editing}
                onChangeText={(text) => setUserInfo({ ...userInfo, fullname: text })}
              />

              <Text style={styles.label}>Giới tính</Text>
              <View style={styles.input}>
                <Picker
                  selectedValue={userInfo.gender}
                  enabled={editing}
                  onValueChange={(value) => setUserInfo({ ...userInfo, gender: value })}
                  style={{ height: 50 }}
                >
                  <Picker.Item label="Nam" value="Nam" />
                  <Picker.Item label="Nữ" value="Nữ" />
                  <Picker.Item label="Khác" value="Khác" />
                </Picker>
              </View>

              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={userInfo.email} editable={false} />

              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={userInfo.phone}
                editable={editing}
                onChangeText={(text) => setUserInfo({ ...userInfo, phone: text })}
              />

              <Text style={styles.label}>Địa chỉ</Text>
              <TextInput
                style={styles.input}
                value={userInfo.address}
                editable={editing}
                onChangeText={(text) => setUserInfo({ ...userInfo, address: text })}
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={editing ? handleSaveProfile : () => setEditing(true)}>
                <Text style={styles.primaryBtnText}>{editing ? "Lưu thông tin" : "Chỉnh sửa thông tin"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={handleViewOrders}>
            <Ionicons name="receipt-outline" size={20} color="#0a87ecff" />
            <Text style={styles.menuText}>Xem lịch sử đơn hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setOldPassword("");
              setNewPassword("");
              setConfirmPass("");
              setShowPasswordModal(true);
            }}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#0a87ecff" />
            <Text style={styles.menuText}>Đổi mật khẩu</Text>
          </TouchableOpacity>
        </View>

        {/* Modal đổi mật khẩu */}
        <Modal visible={showPasswordModal} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Đổi mật khẩu</Text>

            {/* Mật khẩu cũ */}
            <View style={{ position: "relative", marginBottom: 10 }}>
              <TextInput
                style={styles.inputWithIcon}
                secureTextEntry={!showOldPass}
                placeholder="Mật khẩu cũ"
                value={oldPassword}
                onChangeText={setOldPassword}
              />
              <TouchableOpacity style={styles.iconWrapper} 
                onPress={() => setShowOldPass(!showOldPass)}
              >
                <Ionicons
                  name={showOldPass ? "eye" : "eye-off"}
                  size={22}
                  color="#666"
                  style={{ padding: 8 }}
                />
              </TouchableOpacity>
            </View>

            {/* Mật khẩu mới */}
            <View style={{ position: "relative", marginBottom: 10 }}>
              <TextInput
                style={styles.inputWithIcon}
                secureTextEntry={!showNewPass}
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity style={styles.iconWrapper} 
                onPress={() => setShowNewPass(!showNewPass)}
              >
                <Ionicons
                  name={showNewPass ? "eye" : "eye-off"}
                  size={22}
                  color="#666"
                  style={{ padding: 8 }}
                />
              </TouchableOpacity>
            </View>

            {/* Nhập lại mật khẩu */}
            <View style={{ position: "relative", marginBottom: 10 }}>
              <TextInput
                style={styles.inputWithIcon}
                secureTextEntry={!showConfirmPass}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPass}
                onChangeText={setConfirmPass}
              />
              <TouchableOpacity style={styles.iconWrapper} 
                onPress={() => setShowConfirmPass(!showConfirmPass)}
              >
                <Ionicons
                  name={showConfirmPass ? "eye" : "eye-off"}
                  size={22}
                  color="#666"
                  style={{ padding: 8 }}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: "#28a745" }]}
                onPress={handleChangePassword}
              >
                <Text style={styles.secondaryText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: "#f44336" }]}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.secondaryText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

        {/* Đăng xuất */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>{isLoggedIn ? "Đăng xuất" : "Đăng nhập"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  profileHeader: { alignItems: 'center', marginVertical: 5 },
  username: { fontSize: 20, fontWeight: 'bold', color: '#0a87ecff', marginBottom: 10 },
  statsBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "bold", color: "#0a87ecff" },
  statLabel: { fontSize: 13, color: "#555", marginTop: 4 },
  iconcart: { marginRight: 15 },
  badge: { position: 'absolute', top: -5, right: 5, backgroundColor: 'red', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 2 },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16 },
  label: { fontSize: 14, fontWeight: '500', marginTop: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
    height: 50,
    justifyContent: "center"
  },
  primaryBtn: { backgroundColor: '#0a87ecff', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  menu: { backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 15 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  menuText: { marginLeft: 10, fontSize: 16, color: '#333' },
  secondaryButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginHorizontal: 5, elevation: 1 },
  secondaryText: { color: "#fff", fontWeight: "500" },
  row: { flexDirection: "row", marginTop: 15, justifyContent: 'flex-end' },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalBox: { width: "85%", padding: 20, backgroundColor: "#fff", borderRadius: 12, elevation: 5 },
  inputWithIcon: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 40,
    height: 60, 
  },
  iconWrapper: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -19 }], // căn giữa icon
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  logoutBtn: { margin: 20, padding: 14, borderRadius: 8, alignItems: 'center', backgroundColor: '#ff4d4f' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
