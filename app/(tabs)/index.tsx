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
  Modal,
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

interface Filters {
  price?: [number, number];
  condition?: 'new' | 'used';
  category?: string;
  color?: string;
}

const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
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

  // build pipeline
  let pipeline = showOutOfStock
    ? products
    : products.filter((p) => p.stock > 0);

  if (filters.price) {
    const [min, max] = filters.price;
    pipeline = pipeline.filter((p) => p.price >= min && p.price <= max);
  }
  if (filters.condition) {
    pipeline = pipeline.filter((p) => p.condition === filters.condition);
  }
  if (filters.category) {
    pipeline = pipeline.filter((p) => p.categoryId === filters.category);
  }
  if (filters.color) {
    pipeline = pipeline.filter((p) => p.color === filters.color);
  }

  if (searchQuery.trim()) {
    pipeline = pipeline.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const filteredProducts = pipeline;

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
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>{`₱${item.price}`}</Text>
          <View style={styles.ratingRow}>
            <FontAwesome name="star" size={14} color={COLORS.star} />
            <Text style={styles.productRating}>
              {item.rating?.toFixed(1) || 'N/A'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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

      {/* Welcome + Filters button */}
      <View style={styles.titleRow}>
        <Text style={styles.welcomeText}>Welcome!</Text>
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Out-of-stock toggle */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>
          {showOutOfStock ? 'Showing' : 'Hiding'} Out of Stock
        </Text>
        <Switch
          value={showOutOfStock}
          onValueChange={setShowOutOfStock}
          thumbColor={showOutOfStock ? COLORS.primary : '#ccc'}
          trackColor={{ true: '#bb86fc', false: '#eee' }}
        />
      </View>

      {/* Product grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
      />

      <LoginRequiredModal
        visible={showLoginModal}
        onDismiss={() => setShowLoginModal(false)}
      />
      <Toast />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        filters={filters}
        onChange={setFilters}
      />
    </View>
  );
};

// --------- FilterModal Component ---------
type FilterModalProps = {
  visible: boolean;
  onDismiss: () => void;
  filters: Filters;
  onChange: (newFilters: Filters) => void;
};

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onDismiss,
  filters,
  onChange,
}) => {
  const [local, setLocal] = useState<Filters>(filters);

  useEffect(() => {
    if (visible) setLocal(filters);
  }, [visible]);

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onDismiss}
      />
      <View style={styles.filterPanel}>
        <View style={styles.filterHeader}>
          <TouchableOpacity onPress={onDismiss}>
            <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.filterTitle}>Filters</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Example toggles; swap for real pickers */}
        <TouchableOpacity
          style={styles.filterRow}
          onPress={() =>
            setLocal({
              ...local,
              price: local.price ? undefined : [0, 1000],
            })
          }
        >
          <Text>Price {local.price ? `[${local.price[0]}–${local.price[1]}]` : ''}</Text>
          <MaterialIcons name="chevron-right" size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterRow}
          onPress={() =>
            setLocal({
              ...local,
              condition:
                local.condition === 'new' ? 'used' : 'new',
            })
          }
        >
          <Text>Condition {local.condition || ''}</Text>
          <MaterialIcons name="chevron-right" size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterRow}
          onPress={() =>
            setLocal({
              ...local,
              category: local.category === 'Shirts' ? undefined : 'Shirts',
            })
          }
        >
          <Text>Category {local.category || ''}</Text>
          <MaterialIcons name="chevron-right" size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterRow}
          onPress={() =>
            setLocal({
              ...local,
              color: local.color === 'Blue' ? undefined : 'Blue',
            })
          }
        >
          <Text>Color {local.color || ''}</Text>
          <MaterialIcons name="chevron-right" size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => {
            onChange(local);
            onDismiss();
          }}
        >
          <Text style={styles.applyText}>See Items</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
  },
  filterButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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

  // ---- filter modal styles ----
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  filterPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ccc',
    paddingBottom: 32,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#bbb',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  filterTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#999',
  },
  applyButton: {
    margin: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductsScreen;
