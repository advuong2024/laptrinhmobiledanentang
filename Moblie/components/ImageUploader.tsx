import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateAvatarBackend } from "@/assets/data/imformation"

const BACKEND_SIGN_URL = "http://192.168.1.248:8080/image/sign";

interface ImageUploaderProps {
  imageUrl?: string;
  onChangeImage?: (newUrl: string) => void;
  style?: any;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ imageUrl, onChangeImage, style }) => {
  const [localUri, setLocalUri] = useState<string | null>(imageUrl || null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(imageUrl || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isChanged, setIsChanged] = useState<boolean>(false);

  useEffect(() => {
    if (imageUrl) {
      setLocalUri(imageUrl);
      setUploadedUrl(imageUrl);
    }
  }, [imageUrl]);

  // chọn ảnh
  const pickImageNative = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Cần quyền truy cập thư viện ảnh!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setLocalUri(result.assets[0].uri);
      setIsChanged(true); // ✅ có thay đổi
    }
  };

  const handleUpload = async () => {
    if (!localUri && !file) {
      Alert.alert("Chưa chọn ảnh");
      return;
    }

    setLoading(true);
    try {
      const sigRes = await fetch(BACKEND_SIGN_URL);
      const { timestamp, signature, api_key, cloud_name } = await sigRes.json();

      const formData = new FormData();
      if (Platform.OS === "web") {
        formData.append("file", file as File);
      } else {
        const filename = localUri!.split("/").pop() || "image.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("file", {
          uri: localUri,
          type,
          name: filename,
        } as any);
      }

      formData.append("api_key", api_key);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", "signed_uploads");

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;
      const res = await fetch(uploadUrl, { method: "POST", body: formData });
      const data = await res.json();

      if (data.secure_url) {
        setUploadedUrl(data.secure_url);
        onChangeImage?.(data.secure_url);

        // ✅ Lấy user từ AsyncStorage
        const userStr = await AsyncStorage.getItem("user");
        if (!userStr) throw new Error("Không tìm thấy user trong AsyncStorage");
        const user = JSON.parse(userStr);

        // ✅ Gọi backend để cập nhật avatar
        await updateAvatarBackend(user.customer_id, data.secure_url);

        // ✅ Update lại AsyncStorage để giữ avatar mới
        const updatedUser = { ...user, avatar: data.secure_url };
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

        setIsChanged(false); // ✅ đã lưu xong, reset trạng thái
        Alert.alert("Upload thành công!");
      } else {
        throw new Error(data.error?.message || "Upload lỗi");
      }
    } catch (err: any) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.wrapper, style]}>
      {/* Avatar (ấn trực tiếp để đổi ảnh) */}
      <TouchableOpacity onPress={pickImageNative}>
        <Image
          source={{ uri: localUri || "https://via.placeholder.com/120" }}
          style={styles.preview}
        />
      </TouchableOpacity>

      {/* Chỉ hiển thị nút Lưu khi có thay đổi */}
      {isChanged && (
        <TouchableOpacity onPress={handleUpload} disabled={loading} style={styles.uploadBtn}>
          <Text style={{ color: "white" }}>{loading ? "Đang upload..." : "Lưu ảnh"}</Text>
        </TouchableOpacity>
      )}

      {loading && <ActivityIndicator size="large" style={{ marginTop: 10 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { alignItems: "center" },
  preview: {
    height: 120,
    width: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  uploadBtn: {
    marginTop: 12,
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
});

export default ImageUploader;
