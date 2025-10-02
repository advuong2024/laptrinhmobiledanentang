import { useState, useRef, useEffect } from 'react';
import { Image } from 'expo-image';
import { FlatList, StyleSheet, View, Text, TouchableOpacity, ListRenderItem, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native-gesture-handler';
import { fetchProducts, Product, Category, fetchCategorys } from '@/assets/data/products';
import { SLIDER_ITEMS, SliderItem } from '@/assets/data/sliderbar';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [sliderIndex, setSliderIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categorys, setCategorys] = useState<Category[]>([]);
  const [types, setTypes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const productData = await fetchProducts();
      setProducts(productData);

      const categoryData = await fetchCategorys();
      setCategorys(categoryData);
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

  const renderType: ListRenderItem<Category> = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.TypeBox}
        onPress={() => router.push({ pathname: "/type-product", params: { id: item.category_id }})}
      >
        <Image source={item.category_image} style={styles.TypeImage} />
        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>{item.category_name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <FlatList<Product>
        data={products}
        keyExtractor={(item) => item.product_id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'flex-start'}}
        contentContainerStyle={{ paddingBottom: 10, paddingTop: 70 }}

        ListHeaderComponent={
          <>
            <View style={styles.container}>
              <TextInput
                style={styles.input}
                placeholder="Tìm kiếm..."
                value={query}
                onChangeText={setQuery}
              />
              <TouchableOpacity>
                <Ionicons name="search" size={20} color="#888" style={styles.icon} />
              </TouchableOpacity>
            </View>

            <View style={styles.slider}>
              <Carousel 
                loop
                width={width}
                height={200}
                autoPlay
                autoPlayInterval={3000}
                data={SLIDER_ITEMS}
                scrollAnimationDuration={1000}
                onSnapToItem={(index) => setSliderIndex(index)}
                renderItem={({ item }: {item: SliderItem}) => (
                  <Image
                    source={item.src}
                    style={{ width: width, height: 200 }}
                  />
                )}
              />
            </View>

            <View style={styles.itemproduct}>
              <Text
                style={styles.sectionTile}
              >
                Danh mục
              </Text>
              <FlatList
                data={categorys}
                keyExtractor={(item) => item.category_id}
                renderItem={renderType}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 20 }}
              />
            </View>

            <View style={styles.itemproduct}>
              <Text
                style={styles.sectionTile}
              >
                Sản phẩm nổi bật
              </Text>
            </View>
          </>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    top: 50,
    borderRadius: 30,
    padding: 10,
    marginHorizontal: 40,
    paddingLeft: 10,
  },
  icon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    width: 230,
    height: 40,
    padding: 10,
    fontSize: 16,
    color: '#888',
  },
  slider: {
    marginTop: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    height: 200,
  },
   counter: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTile: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 20,
    color: '#000',
  },
  itemproduct: {
    marginTop: 20,
    backgroundColor: '#fff',
  },
  TypeBox: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginRight: 10,
    alignItems: 'center',
  },
  TypeImage: {
    width: 70,
    height: 70,
    borderRadius: 100,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  productWrapper: {
    flex: 1,
    maxWidth: '50%',
    paddingHorizontal: 10,
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
});