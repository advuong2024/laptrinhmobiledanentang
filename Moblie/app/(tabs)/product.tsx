import { useState, useRef, useEffect } from 'react';
import { useRouter, useLocalSearchParams} from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ListRenderItem, FlatList } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { fetchProducts, Product } from '@/assets/data/products';
import { HeaderTitle } from '@react-navigation/elements';

export default function ProductScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
          const productData = await fetchProducts();
          setProducts(productData);
        };
    
        loadData();
      }, []);

    const renderProduct: ListRenderItem<Product> = ({ item }) => (
        <View style={styles.productWrapper}>
          <TouchableOpacity 
            style={styles.productBox}
            onPress={() => router.push({ pathname: '/product_details', params: {id: item.product_id}})}
          >
            <Image source={item.image} style={styles.productImage} />
            <View style={{ flex: 1, alignItems: 'flex-start', width: '100%' }}>
              <Text style={styles.productName}>{item.product_name}</Text>
              <Text style={styles.productPrice}> {Number(item.price).toLocaleString('vi-VN')}đ</Text>
            </View>
          </TouchableOpacity>
        </View>
    );

    return (
        <FlatList
            data={products}
            keyExtractor={(item) => item.product_id}
            renderItem={renderProduct}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between'}}
            contentContainerStyle={{ paddingBottom: 10 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>Sản Phẩm</Text>
                </View>
              </>
            }
      />
    );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'ios' ? 100 : 100,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#0a87ecff',
  },
  iconcart: {
    marginRight: 15,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: 5,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    paddingHorizontal: 15,
    marginBottom: 10
  },
  productWrapper: {
    flex: 1,
    maxWidth: '50%',
    paddingHorizontal: 10,
    marginVertical: 1
  },
  productBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    padding: 10,
    marginBottom: 18,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 14,
    color: '#ff0000ff',
    marginTop: 4,
  },
})