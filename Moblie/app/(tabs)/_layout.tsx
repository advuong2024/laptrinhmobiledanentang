import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import VerticalTabBar from '@/components/VerticalTabBar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CartProvider } from '@/components/CartContext';

export default function CustomTabLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <CartProvider>
        <VerticalTabBar />
        <View style={styles.content}>
          <Slot />
        </View>
      </CartProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
    
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});