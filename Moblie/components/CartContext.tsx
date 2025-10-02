import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCart } from "@/assets/data/Carts"; // API lấy giỏ hàng (đã viết ở trên)

type CartContextType = {
  cartCount: number;
  setCartCount: (count: number) => void;
  increaseCart: (amount?: number) => void;
  decreaseCart: (amount?: number) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartCount, setCartCountState] = useState(0);

  useEffect(() => {
    refreshCart(); // load cart mỗi lần mở app
  }, []);

  // load giỏ hàng từ API (nếu login) hoặc từ local (guest)
  const refreshCart = async () => {
    try {
        const token = await AsyncStorage.getItem("token");

        if (token) {
        // đã đăng nhập -> lấy từ API
        const cartData = await fetchCart();

        // nếu backend trả về danh sách -> tính tổng quantity
        const count = cartData.totalQuantity 
            ?? cartData.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) 
            ?? 0;

        setCartCountState(count);
        } else {
            // chưa đăng nhập -> lấy từ local
            const savedCount = await AsyncStorage.getItem("cartCount");
            setCartCountState(savedCount ? Number(savedCount) : 0);
        }
    } catch (error) {
        console.error("Lỗi khi load giỏ hàng:", error);
    }
  };


  const setCartCount = async (count: number) => {
    setCartCountState(count);
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      // chỉ lưu local khi là guest
      await AsyncStorage.setItem("cartCount", count.toString());
    }
  };

  const increaseCart = async (amount: number = 1) => {
    setCartCountState((prev) => {
      const newCount = prev + amount;
      AsyncStorage.setItem("cartCount", newCount.toString()); // guest
      return newCount;
    });
  };

  const decreaseCart = async (amount: number = 1) => {
    setCartCountState((prev) => {
      const newCount = prev - amount >= 0 ? prev - amount : 0;
      AsyncStorage.setItem("cartCount", newCount.toString()); // guest
      return newCount;
    });
  };

  const clearCart = async () => {
    setCartCountState(0);
    await AsyncStorage.removeItem("cartCount");
  };

  return (
    <CartContext.Provider
      value={{ cartCount, setCartCount, increaseCart, decreaseCart, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart phải được dùng bên trong CartProvider");
  }
  return context;
};
