import { useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
};

export const useApi = () => {
  const router = useRouter();

  const callApi = useCallback(
    async (url: string, options: ApiOptions = {}) => {
      try {
        const token = await AsyncStorage.getItem("token");

        const response = await fetch(url, {
          method: options.method || "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        // Xử lý token hết hạn
        if (response.status === 401) {
          Alert.alert("Phiên đã hết hạn", "Vui lòng đăng nhập lại", [
            { text: "OK", onPress: () => router.push("/login") },
          ]);
          await AsyncStorage.removeItem("token");
          return null;
        }

        const data = await response.json();
        return data;
      } catch (err) {
        console.error("Lỗi API:", err);
        Alert.alert("Lỗi", "Không thể kết nối server");
        return null;
      }
    },
    [router]
  );

  return { callApi };
};