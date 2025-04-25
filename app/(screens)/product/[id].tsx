import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import {
  Product,
  getProduct,
  getProductsByCategory,
} from '@/services/productService';
import { addToCartLocal } from '@/utils/cartStorage';
import {
  addToFavorite,
  isProductInFavorites,
  removeFromFavorite,
} from '@/services/wishlistService';

// Hide the default navigation header
export const options = { headerShown: false };

const { width: screenWidth } = Dimensions.get('window');
const COLORS = {
  primary: '#E91E63',
  background: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: '#666666',
  error: '#B00020',
  surface: '#FAFAFA',
};

const ImageCarousel: React.FC<{ images: { url: string; order: number }[] }> = ({ images }) => (
  <ScrollView
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    style={styles.carouselWrapper}
    contentContainerStyle={styles.carouselContent}
  >
    {images.length > 0 ? (
      images.map((img, idx) => (
        <Image key={idx} source={{ uri: img.url }} style={styles.carouselImage} />
      ))
    ) : (
      <View style={[styles.carouselImage, styles.centered]}>
        <Text style={styles.noImageText}>No Image</Text>
      </View>
    )}
  </ScrollView>
);

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<Product['variants'][number] | null>(null);
  const [variantModalVisible, setVariantModalVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProduct(id)
      .then(setProduct)
      .catch(() => Toast.show({ type: 'error', text1: 'Error loading product' }))
      .finally(() => setLoading(false));

    isProductInFavorites(Number(id))
      .then(setIsFavorite)
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!product) return;
    getProductsByCategory(product.categoryId)
      .then(list => setRecommended(list.filter(p => p.id !== product.id).slice(0, 4)))
      .catch(() => {});
  }, [product]);

  const toggleFavorite = useCallback(async () => {
    if (!product) return;
    try {
      if (isFavorite) await removeFromFavorite(Number(product.id));
      else await addToFavorite(Number(product.id));
      setIsFavorite(f => !f);
    } catch {
      Toast.show({ type: 'error', text1: 'Could not update favorites' });
    }
  }, [isFavorite, product]);

  const addToCart = useCallback(async () => {
    if (!product) return;
    const variant = selectedVariant || product.variants[0];
    if ((variant.stock ?? 0) < 1) {
      return Toast.show({ type: 'error', text1: 'Out of Stock' });
    }
    const newItem = {
      id: Number(product.id),
      productId: Number(product.id),
      name: product.name + (variant.size ? ` • ${variant.size}` : ''),
      price: variant.price || product.price,
      image: product.images?.[0]?.url || '',
      quantity: 1,
      variantId: Number(variant.id),
    };
    const success = await addToCartLocal(newItem);
    Toast.show({ type: success ? 'success' : 'error', text1: success ? 'Added to Cart' : 'Failed to Add' });
    if (success) router.push('/cart');
  }, [product, selectedVariant]);

  if (loading) return <ActivityIndicator style={styles.centered} size="large" color={COLORS.primary} />;
  if (!product) return <View style={styles.centered}><Text style={styles.errorText}>Product not found</Text></View>;

  const defaultVar = selectedVariant || product.variants[0];
  const inStock = (defaultVar.stock ?? 0) > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <ImageCarousel images={product.images || []} />

        <View style={styles.infoCard}>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>₱{(defaultVar.price || product.price).toFixed(2)}</Text>
          <Text style={styles.description}>{product.description}</Text>

          <Text style={[styles.stockBadge, inStock ? styles.inStock : styles.outStock]}> 
            {inStock ? `In Stock: ${defaultVar.stock}` : 'Out of Stock'}
          </Text>

          {product.variants.length > 1 && (
            <TouchableOpacity style={styles.variantSelect} onPress={() => setVariantModalVisible(true)}>
              <Text style={styles.variantText}>{defaultVar.size ?? 'Choose Variant'}</Text>
              <FontAwesome name="angle-down" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {recommended.length > 0 && (
          <View style={styles.recommendSection}>
            <Text style={styles.sectionTitle}>You may also like</Text>
            <FlatList
              data={recommended}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.recommendCard} onPress={() => router.push(`/product/${item.id}`)}>
                  <Image style={styles.recommendImg} source={{ uri: item.images?.[0]?.url || '' }} />
                  <Text style={styles.recommendName} numberOfLines={2}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, inStock ? styles.footerActive : styles.footerDisabled]}>
        <TouchableOpacity style={[styles.cartBtn, !inStock && styles.disabledBtn]} onPress={addToCart} disabled={!inStock}>
          <Text style={styles.cartText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteFooterBtn} onPress={toggleFavorite} accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
          <FontAwesome name={isFavorite ? 'heart' : 'heart-o'} size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <Modal transparent visible={variantModalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Variant</Text>
            <FlatList
              data={product.variants}
              keyExtractor={v => String(v.id)}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.optionRow} onPress={() => { setSelectedVariant(item); setVariantModalVisible(false); }}>
                  <Text style={styles.optionText}>{`${item.size} • ${item.color} • ${item.condition}`}</Text>
                  <Text style={styles.optionPrice}>{`₱${(item.price ?? 0).toFixed(2)}`}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: COLORS.error, fontSize: 18 },
  carouselWrapper: { height: screenWidth * 0.75, backgroundColor: COLORS.surface },
  carouselContent: { alignItems: 'center' },
  carouselImage: { width: screenWidth, height: screenWidth * 0.75, resizeMode: 'cover' },
  noImageText: { color: COLORS.textSecondary },
  infoCard: { margin: 16, backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, elevation: 3 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 8 },
  price: { fontSize: 22, color: COLORS.primary, fontWeight: '600', marginBottom: 8 },
  description: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 12 },
  stockBadge: { alignSelf: 'flex-start', fontSize: 14, fontWeight: '500', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  inStock: { backgroundColor: '#d4edda', color: '#155724' },
  outStock: { backgroundColor: '#f8d7da', color: '#721c24' },
  variantSelect: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  variantText: { fontSize: 16, color: COLORS.textPrimary },
  recommendSection: { marginVertical: 16 },
  sectionTitle: { marginLeft: 16, fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  recommendCard: { width: screenWidth * 0.4, marginLeft: 16, backgroundColor: COLORS.surface, borderRadius: 8, overflow: 'hidden', elevation: 2 },
  recommendImg: { width: '100%', height: screenWidth * 0.4 },
  recommendName: { padding: 8, fontSize: 14, color: COLORS.textPrimary },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: COLORS.surface, elevation: 4 },
  footerActive: {},
  footerDisabled: { opacity: 0.6 },
  cartBtn: { flex: 1, marginRight: 16, padding: 16, backgroundColor: COLORS.primary, borderRadius: 8, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#ccc' },
  cartText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  favoriteFooterBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalCard: { backgroundColor: COLORS.surface, borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: '40%', padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  optionRow: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' },
  optionText: { fontSize: 16, color: COLORS.textPrimary },
  optionPrice: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
});
