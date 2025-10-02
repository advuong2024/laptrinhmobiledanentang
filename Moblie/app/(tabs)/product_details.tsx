import { useState, useEffect } from 'react';
import { Image } from 'expo-image';
import { Platform, StyleSheet, View, Text, TouchableOpacity, ListRenderItem, FlatList, Alert } from 'react-native';
import { useRouter, useLocalSearchParams} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native-gesture-handler';
import { addToCart } from '@/assets/data/Carts';
import { fetchProductid, Product } from '@/assets/data/products';
import { fetchVariantsid, Variants, DetailPs, fetchDetailsid } from '@/assets/data/productVariants';
import { fetchProductView, Reviews, fetchReviewStats, ReviewStats } from '@/assets/data/reviews';
import { useCart } from '@/components/CartContext'
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{id: string}>();
  const [product, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variants[]>([]);
  const [reviews, setReviews] = useState<Reviews[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const {cartCount, setCartCount} = useCart();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showAll, setShowAll] = useState(false)
  const [details, setDetails] = useState<DetailPs[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const increaseQty = (id: string, stock: number) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      if (current < stock) {
        return { ...prev, [id]: current + 1 };
      } else {
        Alert.alert("Thông báo", "Số lượng đã đạt tối đa trong kho");
        return prev;
      }
    });
  };
  const decreaseQty = (id: string) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      return { ...prev, [id]: current > 1 ? current - 1 : 1 };
    });
  };

  useEffect(() => {
    const loadData = async() => {
      const Productid = await fetchProductid(id)
      setProducts(Productid)

      const VariantData = await fetchVariantsid(id)
      setVariants(VariantData)

      const ReviewData = await fetchProductView(id)
      setReviews(ReviewData)

      const StatsData = await fetchReviewStats(id)
      setStats(StatsData[0])

      const DetailsData = await fetchDetailsid(id);
      setDetails(DetailsData);
    }
    loadData();
  },[id])

  const selectedVariant = variants.find(
    v => v.color === selectedColor && v.size === selectedSize
  )

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  const handleAddTocart = async () => {
    if (!selectedVariant){
      Alert.alert("Thông báo","Vui lòng chọn màu sắc và size trước khi thêm vào giỏ!");
      return;
    }

    const currentProduct = product[0];
    const quantity = quantities[currentProduct.product_id] || 1;

    try {
      const res = await addToCart(Number(selectedVariant.variant_id), quantity);

      setCartCount(res.totalQuantity);
    } catch (error) {
      console.error("Add to cart error:", error);
      Alert.alert("Lỗi", "Không thêm được sản phẩm vào giỏ.");
    }
  }

  useEffect(() => {
    if (product.length > 0) {
      setQuantities(prev => ({
        ...prev,
        [product[0].product_id]: 1
      }));
    }
  }, [selectedSize, selectedColor]);

  const handleBuyNow = async () => {
    if (!selectedVariant) {
      Alert.alert("Thông báo", "Vui lòng chọn màu sắc và size trước khi mua!");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("user");

      if (!token || !user) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập");
        router.push({pathname: '/login'});
        return;
      }

      const currentProduct = product[0];
      const quantity = quantities[currentProduct.product_id] || 1;

      router.push({
        pathname: '/checkout', 
        params: {
          id: selectedVariant?.variant_id.toString(), 
          type: 'buyNow', quantity: quantity,
        }});
    } catch (error) {
      console.error("Lỗi khi kiểm tra đăng nhập:", error);
    }
  }

  const renderProduct: ListRenderItem<Product> = ({ item }) => (
    <View style={styles.productBox}>
      <Image 
        source={selectedImage ? { uri: selectedImage } : { uri: item.image }}  
        style={styles.productImage} 
      />
      <View style={{ flex: 1, width: '100%' }}>
        <Text style={styles.productPrice}>{Number(item.price).toLocaleString('vi-VN')} đ</Text>
        <Text style={styles.productName}>{item.product_name}</Text>
        <Text style={{ marginTop: 5, marginStart: 20, fontSize: 16 }}>Màu Sắc</Text>
        <FlatList
          data={[...new Set(variants.map(v => v.color))]}
          keyExtractor={(color, index) => `${color}-${index}`}
          numColumns={3}
          style={{ marginTop: 5, marginStart: 30, marginEnd: 15 }}
          columnWrapperStyle={{ paddingVertical: 5 }}
          renderItem={({ item: color }) => {
            const hasStock = variants.some(v => v.color === color && v.stock > 0);
            return (
              <TouchableOpacity
                style={[
                  styles.colorBox,
                  selectedColor === color && { borderColor: '#0a87ecff', borderWidth: 2 },
                  !hasStock && { opacity: 0.3 }
                ]}
                disabled={!hasStock}
                onPress={() => {
                  setSelectedColor(color);

                  const variant = variants.find(v => v.color === color);
                  if (variant) {
                    setSelectedImage(variant.image);
                  }
                }}
              >
                <Image
                  source={variants.find(v => v.color === color)?.image}
                  style={styles.colorImage}
                />
                <Text style={styles.colorLabel}>{color}</Text>
              </TouchableOpacity>
            )
          }}
        />
        {variants && variants.length > 0 && (
          <>
            <Text style={{ marginTop: 5, marginStart: 20, fontSize: 16 }}>Size</Text>
            <FlatList
            data={[...new Set(variants.map(v => v.size))]}
            keyExtractor={(size, index) => `${size}-${index}`}
            style={{ marginTop: 5, marginStart: 30, marginEnd: 15 }}
            numColumns={3}
            columnWrapperStyle={{ paddingVertical: 5 }}
            renderItem={({ item: size }) => {
                const hasStock = variants.some(
                v =>
                    v.size === size &&
                    (!selectedColor || v.color === selectedColor) &&
                    v.stock > 0
                );

                return (
                <TouchableOpacity
                    style={[
                    styles.sizeBox,
                    selectedSize === size && { borderColor: '#0a87ecff', borderWidth: 2 },
                    !hasStock && { opacity: 0.3 }
                    ]}
                    disabled={!hasStock}
                    onPress={() => setSelectedSize(size)}
                >
                    <Text style={styles.sizeLabel}>{size}</Text>
                </TouchableOpacity>
                );
            }}
            />
          </>
        )}
        <View style={styles.CountRow}>
          <Text style={{ marginTop: 5, marginStart: 20, fontSize: 16, marginRight: 10 }}>Số Lượng</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.qtyButton} onPress={() => decreaseQty(item.product_id)}>
              <Text style={styles.qtyText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyNumber}>{quantities[item.product_id] || 1}</Text>
            <TouchableOpacity style={styles.qtyButton} 
              onPress={() => increaseQty(item.product_id, selectedVariant ? selectedVariant.stock : totalStock)}
            >
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 16 }}>Kho: {selectedVariant ? selectedVariant.stock : totalStock}</Text>
        </View>
        <Text style={{ marginTop: 5, marginStart: 20, fontSize: 16 }}>Mô tả</Text>
        <Text style={styles.productDescribe}>{(desc => desc.replace(/\\n/g, '\n'))(item.description ?? "")}</Text>
      </View>
    </View>
  );

  const renderStars = (stars: number, size = 14) =>{
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 >= 0.25 && stars % 1 < 0.75;
    const totalStars = 5;

    return (
      <View style={{ flexDirection: "row" }}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <Ionicons
            key={`full-${i}`}
            name="star"
            size={size}
            color="#FFD700"
            onPress={() => setRating(i + 1)}
          />
        ))}
        {hasHalfStar && (
          <Ionicons
            key="half-${fullStars}"
            name="star-half"
            size={size}
            color="#FFD700"
            onPress={() => setRating(fullStars + 0.5)}
          />
        )}
        {Array.from({
          length: totalStars - fullStars - (hasHalfStar ? 1 : 0),
        }).map((_, i) => (
          <Ionicons
            key={`empty-${i}`}
            name="star-outline"
            size={size}
            color="#FFD700"
            onPress={() => setRating(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
          />
        ))}
      </View>
    );
  };

  const renderItem: ListRenderItem<Reviews> = ({ item }) => (
    <View style={styles.reviewItem}>
      <Text style={styles.userName}>{item.fullname}</Text>
      {renderStars(item.rating)}
      <Text style={styles.comment}>{item.comment}</Text>
      <Text style={styles.date}>{item.created_at}</Text>
    </View>
  );

  return (
    <>
      <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.push({ pathname: '/' })}
            >
              <Ionicons name="arrow-back" size={24} color="#0a87ecff" />
              <Text style={styles.backButtonText}>Sản phẩm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push({pathname: '/(tabs)/cart'})}
            >
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
      <FlatList 
        data={product}
        keyExtractor={(item, index) => item?.product_id? item.product_id.toString() : index.toString()}
        renderItem={renderProduct}
        contentContainerStyle={{ paddingBottom: 8, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <>
            <TouchableOpacity
              style={styles.buttonDetail}
              onPress={() => setShowDetails(!showDetails)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {showDetails ? "Ẩn chi tiết sản phẩm" : "Chi tiết sản phẩm"}
              </Text>
            </TouchableOpacity>

            {showDetails && (
              <View style={{ marginHorizontal: 20, marginBottom: 10 }}>
                {details.map((d) => (
                  <View
                    key={d.detail_id}
                    style={styles.showDetailPs}
                  >
                    <Text style={{ flex: 1, fontWeight: "bold", color: "#333" }}>
                      {d.detail_key}
                    </Text>
                    <Text style={{ flex: 1, color: "#555" }}>{d.detail_value}</Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={{ marginTop: 5, marginStart: 20, fontSize: 16 }}>Đánh giá sản phẩm</Text>
            <View style={styles.container}>
              <View style={styles.summary}>
                <Text style={styles.average}>{stats ? stats.avg_rating : 0} <Text style={{ fontSize: 18}}>trên 5</Text></Text>
                {renderStars(4.5, 24)}
                <Text style={styles.count}>{stats ? stats.total_review : 0} đánh giá</Text>
              </View>

              {/* <View style={styles.addReview}>
                <Text style={styles.label}>Đánh giá của bạn:</Text>
                {renderStars(rating, 24)}
                <TextInput 
                  style={styles.input}
                  placeholder='Viết bình luận...'
                  value={comment}
                  onChangeText={setComment}
                  multiline
                />
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Gửi đánh giá</Text>
                </TouchableOpacity>
              </View> */}

              <FlatList
                data={showAll ?  reviews: reviews.slice(0, 3)}
                renderItem={renderItem}
                keyExtractor={(item, index) => item?.review_id ? item.review_id.toString() : index.toString()}
                ListFooterComponent={
                  !showAll && reviews.length > 3 ? (
                    <TouchableOpacity onPress={() => setShowAll(true)}>
                      <Text style={{textAlign: 'center', color: '#0a87ecff', marginTop: 10}}>Mở tất cả</Text>
                    </TouchableOpacity>
                  ): null
                }
              />
            </View>
          </>
        }
      />
      <View style={styles.footer}>
        <>
            <TouchableOpacity style={styles.BuyButton} onPress={handleAddTocart}>
              <Ionicons name="cart" size={22} color="#fff" style={styles.iconcart} />
              <Text style={{ color: '#fff', fontSize: 16 }}>Thêm vào giỏ hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.PayButton} onPress={handleBuyNow}>
              <Ionicons name="cash" size={22} color="#fff" style={styles.iconcart} />
              <Text style={{ color: '#fff', fontSize: 16 }}>Mua ngay</Text>
            </TouchableOpacity>
        </>
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
  productBox: {
    width: '100%',
    height: 'auto',
  },
  productImage: {
    minHeight: 390,
    marginHorizontal: 20,
  },
  productName: {
    fontSize: 18,
    marginEnd: 20,
    paddingBottom: 10,
    marginStart: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  productPrice: {
    paddingTop: 10,
    fontSize: 22,
    marginStart: 20,
    marginEnd: 20,
    color: 'red',
    marginBottom: 10,
  },
  CountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 6,
    paddingBottom: 10,
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
    fontSize: 14,
    color: 'green',
    borderWidth: 1,
    borderColor: '#ccc',
    width: 40,
    textAlign: 'center',
    paddingTop: 4,
    height: 28
  },
  productDescribe: {
    fontSize: 16,
    marginStart: 20,
    marginEnd: 20,
    paddingTop: 5,
    color: '#333',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  colorBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    marginEnd: 10,
  },
  colorImage: {
    width: 15,
    height: 25,
    margin: 5,
  },
  colorLabel: {
    fontSize: 13,
    color: '#333',
    padding: 5,
  },
  sizeBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginEnd: 10,
  },
  sizeLabel: {
    padding: 5,
    fontSize: 13,
    color: '#333'
  },
  buttonDetail: {backgroundColor: "#0a87ecff", padding: 10, borderRadius: 6, margin: 20, alignItems: "center"},
  showDetailPs: {flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 6},
  container: { flex: 1, marginLeft:20, marginRight: 15 },
  summary: { alignItems: "center", marginBottom: 20 },
  average: { fontSize: 30, fontWeight: "bold", color: "#333" },
  count: { marginTop: 4, color: "#666" },
  addReview: { marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 8},
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    minHeight: 60,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#0a87ecff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  reviewItem: { borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 12 },
  userName: { fontWeight: "600", marginBottom: 4 },
  comment: { marginTop: 4, color: "#333" },
  date: { fontSize: 12, color: "#999", marginTop: 2 },
  footer: {
    flexDirection: 'row',
    width: '100%',
    bottom: 0,
    left: 0,
    marginBottom: 15
  },
  BuyButton: {
    flex: 3,
    backgroundColor: 'green',
    height: 50,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  PayButton: {
    flex: 2,
    flexDirection: 'row',
    height: 50,
    padding: 10,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
  },
});