import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { getProducts, Product } from '@/services/productService';
import { addToCartLocal, getCartItems, CartItem } from '@/utils/cartStorage';
import Header from '@/components/Header';
import SkeletonLoader from '@/components/SkeletonLoader';
import LoginRequiredModal from '@/components/LogInRequiredModal';

const screenWidth = Dimensions.get('window').width;

const COLORS = {
  primary: '#F53F3FFF',
  background: '#F2F2F2',
  surface: '#FFFFFF',
  error: '#B00020',
  textPrimary: '#000000',
  textSecondary: '#666666',
  star: '#FFD700',
};

interface ImageItem {
  url: string;
  altText?: string;
  order: number;
}

const ImageCarousel: React.FC<{ images: ImageItem[]; style?: any }> = ({ images, style }) => (
  <FlatList
    data={images.sort((a, b) => a.order - b.order)}
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    keyExtractor={(item, index) => `${item.order}-${index}`}
    renderItem={({ item }) => (
      <Image source={{ uri: item.url }} style={[styles.productImage, style]} />
    )}
  />
);

const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const router = useRouter();

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await getProducts();
      setProducts(fetched);
    } catch {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    const saved = await getCartItems();
    setCartItems(saved);
  };

  useEffect(() => {
    fetchProducts();
    fetchCartItems();
  }, []);

  const availableProducts = showOutOfStock ? products : products.filter(p => p.stock > 0);
  const filteredProducts = searchQuery.trim()
    ? availableProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableProducts;
  const recommendedProducts = searchQuery.trim()
    ? [...filteredProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4)
    : [];

  const renderItem = ({ item }: { item: Product }) => {
    const isOut = item.stock === 0;
    return (
      <TouchableOpacity
        style={[styles.productCard, isOut && styles.outOfStockCard]}
        onPress={() => router.push(`/product/${item.id}`)}
        disabled={isOut}
        activeOpacity={0.8}
      >
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
          {isOut && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>Out of Stock</Text>
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productPrice}>{`₱${item.price}`}</Text>
          <View style={styles.ratingRow}>
            <FontAwesome name="star" size={14} color={COLORS.star} />
            <Text style={styles.productRating}>{item.rating?.toFixed(1) || 'N/A'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecommendedItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.recommendationCard}
      onPress={() => router.push(`/product/${item.id}`)}
      activeOpacity={0.8}
    >
      {item.images && item.images.length > 1 ? (
        <ImageCarousel images={item.images} style={styles.recommendationImage} />
      ) : (
        <Image source={{ uri: item.image }} style={styles.recommendationImage} />
      )}
      <Text style={styles.recommendationName} numberOfLines={2}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header onSearch={setSearchQuery} />
        <FlatList
          data={Array.from({ length: 10 })}
          renderItem={() => <SkeletonLoader />}
          keyExtractor={(_, i) => String(i)}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header onSearch={setSearchQuery} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onSearch={setSearchQuery} />

      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>{showOutOfStock ? 'Showing' : 'Hiding'} Out of Stock</Text>
        <Switch
          value={showOutOfStock}
          onValueChange={setShowOutOfStock}
          thumbColor={showOutOfStock ? COLORS.primary : '#ccc'}
          trackColor={{ true: '#bb86fc', false: '#eee' }}
        />
      </View>

      {searchQuery.trim() !== '' && recommendedProducts.length > 0 && (
        <View style={styles.recommendationContainer}>
          <Text style={styles.recommendationTitle}>Recommended Products</Text>
          <FlatList
            data={recommendedProducts}
            renderItem={renderRecommendedItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16 }}
          />
        </View>
      )}

      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
      />

      <LoginRequiredModal visible={showLoginModal} onDismiss={() => setShowLoginModal(false)} />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageWrapper: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  productCard: {
    flex: 0.48,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 16,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android elevation
    elevation: 3,
  },
  outOfStockCard: {
    opacity: 0.6,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  productImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productRating: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toggleLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  recommendationContainer: {
    marginTop: 20,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  recommendationCard: {
    width: screenWidth * 0.4,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  recommendationName: {
    padding: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});

export default ProductsScreen;