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
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const { width: screenWidth } = Dimensions.get('window');

const ImageCarousel: React.FC<{ images: { url: string; order: number }[] }> = ({
  images,
}) => {
  const slides = images.length > 0 ? images : [{ url: '', order: 0 }];
  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carouselContainer}
    >
      {slides.map((item, idx) => (
        <Image key={idx} source={{ uri: item.url }} style={styles.carouselImage} />
      ))}
    </ScrollView>
  );
};

const ProductDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [variantModalVisible, setVariantModalVisible] = useState(false);

  // Load product
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProduct(id)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

 const navigation = useNavigation();
     useEffect(() => {
         navigation.setOptions({
             headerShown: false,
         });
     }, [navigation]);
  // Check favorite status
  useEffect(() => {
    if (!id) return;
    isProductInFavorites(Number(id))
      .then(setIsFavorite)
      .catch(console.error);
  }, [id]);

  // Load recommendations
  useEffect(() => {
    if (!product?.categoryId) return;
    getProductsByCategory(product.categoryId)
      .then((all) =>
        setRecommended(all.filter((p) => p.id !== product.id).slice(0, 4))
      )
      .catch(console.error);
  }, [product]);

  const handleToggleFavorite = useCallback(async () => {
    if (!product) return;
    try {
      if (isFavorite) {
        await removeFromFavorite(Number(product.id));
      } else {
        await addToFavorite(Number(product.id));
      }
      setIsFavorite((f) => !f);
    } catch (err) {
      console.error(err);
      Toast.show({ type: 'error', text1: 'Could not update favorites.' });
    }
  }, [isFavorite, product]);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    if (product.variants.length > 1 && !selectedVariant) {
      return Toast.show({
        type: 'error',
        text1: 'Please select a variant first.',
      });
    }

    const variant = selectedVariant ?? product.variants[0];
    const newCartItem = {
      id: Number(product.id),
      productId: Number(product.id),
      name: `${product.name}${
        variant.size ? ' • ' + variant.size : ''
      }${variant.color ? ' • ' + variant.color : ''}`,
      price: variant.price ?? product.price,
      image: product.images?.[0]?.url ?? '',
      quantity: 1,
      variantId: variant.id,
      size: variant.size,
      color: variant.color,
    };

    const success = await addToCartLocal(newCartItem);
    Toast.show({
      type: success ? 'success' : 'error',
      text1: success ? 'Added to Cart' : 'Add to Cart Failed',
    });
    if (success) router.push('/cart');
  }, [product, selectedVariant, router]);

  const openVariantPicker = () => setVariantModalVisible(true);
  const onSelectVariant = (v: any) => {
    setSelectedVariant(v);
    setVariantModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E91E63" />
      </View>
    );
  }
  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Product Details</Text>
        <TouchableOpacity onPress={() => router.push('/cart')}>
          <FontAwesome name="shopping-cart" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ImageCarousel images={product.images || []} />

        <View style={styles.detailsContainer}>
          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.productPrice}>₱ {product.price.toFixed(2)}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          <View style={styles.starContainer}>
            {Array.from({ length: 5 }).map((_, i) => (
              <FontAwesome
                key={i}
                name={i < Math.round(product.rating) ? 'star' : 'star-o'}
                size={20}
                color="#FFD700"
              />
            ))}
          </View>
        </View>

        {recommended.length > 0 && (
          <View style={styles.recommendationContainer}>
            <Text style={styles.recommendationTitle}>Recommended</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recommended.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recommendationCard}
                  onPress={() => router.push(`/product/${item.id}`)}
                >
                  <Image
                    source={{ uri: item.images?.[0]?.url ?? '' }}
                    style={styles.recommendationImage}
                  />
                  <Text style={styles.recommendationName}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Variant Selector */}
      {product.variants.length > 1 && (
        <TouchableOpacity style={styles.variantBtn} onPress={openVariantPicker}>
          <Text style={styles.variantBtnText}>
            {selectedVariant
              ? `Variant: ${selectedVariant.size || ''} ${selectedVariant.color || ''}`
              : 'Choose Variant'}
          </Text>
          <FontAwesome name="angle-down" size={20} />
        </TouchableOpacity>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            product.variants.length > 1 && !selectedVariant
              ? styles.addDisabled
              : {},
          ]}
          onPress={handleAddToCart}
          disabled={product.variants.length > 1 && !selectedVariant}
        >
          <FontAwesome
            name="shopping-cart"
            size={20}
            color="#fff"
            style={styles.actionIcon}
          />
          <Text style={styles.actionText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
          accessibilityLabel={
            isFavorite ? 'Remove from favorites' : 'Add to favorites'
          }
        >
          <FontAwesome
            name={isFavorite ? 'heart' : 'heart-o'}
            size={24}
            color={isFavorite ? '#E91E63' : '#555'}
          />
        </TouchableOpacity>
      </View>

      {/* Variant Picker Modal */}
      <Modal
        visible={variantModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setVariantModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setVariantModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Variant</Text>
            <FlatList
              data={product.variants}
              keyExtractor={(v) => String(v.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.variantOption}
                  onPress={() => onSelectVariant(item)}
                >
                  <Text>
                    {item.size || ''} • {item.color || ''} • {item.condition || ''} — ₱
                    {(item.price ?? product.price).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 18 },

  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  screenTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },

  scrollContent: { paddingBottom: 140 },
  carouselImage: {
    width: screenWidth,
    height: screenWidth * 0.75,
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },

  detailsContainer: { padding: 16 },
  productTitle: { fontSize: 28, fontWeight: 'bold', color: '#222' },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E91E63',
    marginVertical: 8,
  },
  productDescription: { fontSize: 16, color: '#444', lineHeight: 22 },
  starContainer: { flexDirection: 'row', marginVertical: 8 },

  recommendationContainer: { padding: 16 },
  recommendationTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  recommendationCard: {
    marginRight: 12,
    width: screenWidth * 0.4,
    alignItems: 'center',
  },
  recommendationImage: {
    width: '100%',
    height: screenWidth * 0.4,
    borderRadius: 8,
  },
  recommendationName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },

  variantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
  },
  variantBtnText: { flex: 1, fontSize: 16 },

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ff6666',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addDisabled: { backgroundColor: '#ccc' },
  actionIcon: { marginRight: 8 },
  actionText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  favoriteButton: {
    marginLeft: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    maxHeight: '40%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  variantOption: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
  carouselContainer: {},
});

export default ProductDetailsScreen;
