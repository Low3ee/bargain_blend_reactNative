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
  ScrollView,
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
  condition?: string;
  categoryId?: number;
  color?: string;
}

const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filter data sources
  const [categories, setCategories] = useState<number[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  // UI state
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const router = useRouter();

  // 1) fetch products + derive filter lists
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const fetched = await getProducts();
      setProducts(fetched);
      // categories from categoryId
      setCategories(Array.from(new Set(fetched.map(p => Number(p.categoryId)))));
      // conditions/colors from variants
      const conds = new Set<string>();
      const cols = new Set<string>();
      fetched.forEach(p =>
        p.variants.forEach(v => {
          if (v.condition) {
            conds.add(v.condition);
          }
          if (v.color) {
            cols.add(v.color);
          }
        })
      );
      setConditions(Array.from(conds));
      setColors(Array.from(cols));
    } catch {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    const saved = await getCartItems();
    setCartItems(saved);
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  // 2) build filtered pipeline
  let pipeline = showOutOfStock
    ? products
    : products.filter(p => p.stock > 0);

  // price
  if (filters.price) {
    const [min, max] = filters.price;
    pipeline = pipeline.filter(p => p.price >= min && p.price <= max);
  }
  // condition
  if (filters.condition) {
    pipeline = pipeline.filter(p =>
      p.variants.some(v => v.condition === filters.condition)
    );
  }
  // category
  if (filters.categoryId != null) {
    pipeline = pipeline.filter(p => Number(p.categoryId) === filters.categoryId);
  }
  // color
  if (filters.color) {
    pipeline = pipeline.filter(p =>
      p.variants.some(v => v.color === filters.color)
    );
  }
  // search
  if (searchQuery.trim()) {
    pipeline = pipeline.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const filteredProducts = pipeline;

  // 3) render
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
          <Image source={{ uri: item.images?.[0]?.url ?? '' }} style={styles.productImage} />
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
            <Text style={styles.productRating}>{item.rating.toFixed(1)}</Text>
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
          data={[...Array(8)]}
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

      {/* toggle + filter button */}
      <View style={styles.titleRow}>
        <Switch
          value={showOutOfStock}
          onValueChange={setShowOutOfStock}
          thumbColor={showOutOfStock ? COLORS.primary : '#ccc'}
          trackColor={{ true: '#bb86fc', false: '#eee' }}
        />
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* product grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={p => String(p.id)}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
      />

      <LoginRequiredModal visible={showLoginModal} onDismiss={() => setShowLoginModal(false)} />
      <Toast />

      {/* Filter Modal */}
      <Modal animationType="slide" transparent visible={showFilters}>
        <TouchableOpacity style={styles.backdrop} onPress={() => setShowFilters(false)} />
        <View style={styles.filterPanel}>
          <Text style={styles.filterTitle}>Filters</Text>
          <ScrollView>
            {/* Category */}
            <Text style={styles.filterHeading}>Category</Text>
            {categories.map(cid => (
              <TouchableOpacity
                key={cid}
                style={[styles.filterOption, filters.categoryId === cid && styles.filterOptionActive]}
                onPress={() => setFilters(f => ({ ...f, categoryId: f.categoryId === cid ? undefined : cid }))}
              >
                <Text>Category #{cid}</Text>
              </TouchableOpacity>
            ))}

            {/* Color */}
            <Text style={styles.filterHeading}>Color</Text>
            {colors.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.filterOption, filters.color === c && styles.filterOptionActive]}
                onPress={() => setFilters(f => ({ ...f, color: f.color === c ? undefined : c }))}
              >
                <Text>{c}</Text>
              </TouchableOpacity>
            ))}

            {/* Condition */}
            <Text style={styles.filterHeading}>Condition</Text>
            {conditions.map(cond => (
              <TouchableOpacity
                key={cond}
                style={[styles.filterOption, filters.condition === cond && styles.filterOptionActive]}
                onPress={() => setFilters(f => ({ ...f, condition: f.condition === cond ? undefined : cond }))}
              >
                <Text>{cond}</Text>
              </TouchableOpacity>
            ))}

            {/* Price stub */}
            <Text style={styles.filterHeading}>Price (₱)</Text>
            <TouchableOpacity
              style={[styles.filterOption, filters.price && styles.filterOptionActive]}
              onPress={() => setFilters(f => ({ ...f, price: f.price ? undefined : [0, 100] }))}
            >
              <Text>{filters.price ? `₱${filters.price[0]}–${filters.price[1]}` : 'Any'}</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={styles.applyButton} onPress={() => setShowFilters(false)}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  filterButtonText: { color: COLORS.primary, fontWeight: '600' },
  listContent: { padding: 16 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 16 },
  imageWrapper: { borderRadius: 12, overflow: 'hidden', backgroundColor: COLORS.surface },
  productCard: { width: '48%', backgroundColor: COLORS.surface, borderRadius: 12, elevation: 3 },
  outOfStockCard: { opacity: 0.5 },
  productImage: { width: '100%', height: 140 },
  cardContent: { padding: 8 },
  productName: { fontSize: 16, fontWeight: '600' },
  productPrice: { fontSize: 16, color: COLORS.primary },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  productRating: { marginLeft: 4 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  filterPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface, maxHeight: '60%',
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  filterTitle: { fontSize: 18, fontWeight: '600', padding: 16, textAlign: 'center' },
  filterHeading: { marginLeft: 16, marginTop: 12, fontWeight: '600' },
  filterOption: { padding: 12, marginHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginTop: 4 },
  filterOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, },
  applyButton: { margin: 16, backgroundColor: COLORS.primary, borderRadius: 24, padding: 12, alignItems: 'center' },
  applyText: { color: '#fff', fontWeight: '600' },
  errorText: { color: COLORS.error, textAlign: 'center', marginTop: 20 },
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
});

export default ProductsScreen;
