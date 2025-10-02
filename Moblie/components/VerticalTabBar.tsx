import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { IconSymbol } from '../components/ui/icon-symbol';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/components/CartContext'

const TABS = [
  { name: '', label: 'Trang chủ', icon: 'house.fill' },
  { name: 'product', label: 'Sản phẩm', icon: 'cube' },
];

const HEADER_HEIGHT = 60;
const MENU_WIDTH = 180;

export default function VerticalTabBar() {
  const router = useRouter();
  const segments = useSegments();
  const current = segments[segments.length - 1];
  const pathname = usePathname();
  const { cartCount } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current; // start hidden

  const toggleMenu = () => {
    if (isOpen) {
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 280,
        useNativeDriver: false,
      }).start(() => setIsOpen(false));
    } else {
      setIsOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  if (pathname === '/' || pathname === '/product') {
    return (
      <>
        {/* Nút mở menu (nằm trên cùng, bên trái) */}
        {!isOpen && (
          <TouchableOpacity style={[styles.openButton, { top: HEADER_HEIGHT - 22 }]} onPress={toggleMenu}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>≡</Text>
          </TouchableOpacity>
        )}

        {/* Sliding menu (bắt đầu ngay dưới header) */}
        <Animated.View style={[styles.container, { left: slideAnim, top: HEADER_HEIGHT - 10 }]}>
          <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}>
            <Text style={{ fontSize: 20, color: '#888' }}>✕</Text>
          </TouchableOpacity>

          <View style={styles.tabContainer}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab.name}
                style={[styles.tab, current === tab.name && styles.activeTab]}
                onPress={() => {
                  router.replace(`/${tab.name}` as any);
                  toggleMenu();
                }}
              >
                <IconSymbol
                  name={tab.icon as any}
                  size={28}
                  color={current === tab.name ? '#007AFF' : '#888'}
                />
                <Text style={[styles.label, current === tab.name && styles.activeLabel]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Header cố định (nền trắng, không trong suốt) */}
        <View style={[styles.header, { height: 90 }]}>
          <View style={styles.leftPlaceholder} />
          <View style={styles.rightIcons}>
            <TouchableOpacity onPress={() => router.push({ pathname: '/imformation' })}>
              <Ionicons name="person" size={24} color="#000" style={{ marginEnd: 14 }} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/cart' })}>
              <View style={{ position: 'relative' }}>
                <Ionicons name="cart" size={24} color="#000" style={{ marginEnd: 14 }}/>
                {cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  // Sliding menu
  container: {
    position: 'absolute',
    left: -MENU_WIDTH, // ẩn ban đầu
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: '#f9f9f9',
    borderRightWidth: 1,
    borderRightColor: '#EEE',
    paddingTop: 16,
    zIndex: 2000,
    // đảm bảo menu nằm dưới header (header zIndex cao hơn)
  },
  openButton: {
    position: 'absolute',
    left: 12,
    zIndex: 1100,
    backgroundColor: '#fff',
    padding: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1200,
  },
  tabContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    marginBottom: 28,
    opacity: 0.8,
  },
  activeTab: {
    opacity: 1,
  },
  label: {
    fontSize: 12,
    marginTop: 6,
    color: '#666',
  },
  activeLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },

  // Header (cố định)
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 1000,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    paddingTop: 20,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  leftPlaceholder: {
    flex: 1,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // badge
  badge: {
    position: 'absolute',
    top: -6,
    right: 7,
    backgroundColor: 'red',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
