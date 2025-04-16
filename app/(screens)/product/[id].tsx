import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Product, getProduct, getProductsByCategory } from '@/app/services/productService';
import { addToCartLocal } from '@/app/utils/cartStorage';
import { addToFavorite, isProductInFavorites, removeFromFavorite } from '@/app/services/wishlistService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ImageCarousel: React.FC<{ images: { url: string; order: number }[] }> = ({ images }) => {
  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carouselContainer}
    >
      {(images.length > 0 ? images : [{ url: '', order: 0 }]).map((item, index) => (
        <Image
          key={index}
          source={{ uri: item.url }}
          style={styles.carouselImage}
        />
      ))}
    </ScrollView>
  );
};

const ProductDetailsScreen: React.FC = () => {
  // Get the product ID from local search params.
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        if (product) {
          await removeFromFavorite(Number(product.id));
        }
        setIsFavorite(false);
      } else {
        if (product) {
          await addToFavorite(Number(product.id));
        }
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Fetch product by ID.
  useEffect(() => {
    if (id) {
      // console.log('Fetching product with ID:', id);
      setLoading(true);
      getProduct(id)
        .then((prod) => setProduct(prod))
        .catch((err) => console.error('Error loading product:', err))
        .finally(() => setLoading(false));
    }

  }, [id]);

  useEffect(() => {
    if (!id) return;

    const checkFavoriteStatus = async () => {
      try {
        const isFav = await isProductInFavorites(Number(id));
        // console.log('Favorite status:', isFav);
        setIsFavorite(isFav);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    // Ensure the favorite status is checked before rendering
    setLoading(true);
    checkFavoriteStatus().finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (product && product.categoryId) {
      getProductsByCategory(product.categoryId)
        .then((data) => {
          const recs = data.filter((p) => p.id !== product.id);
          setRecommendedProducts(recs.slice(0, 4));
        })
        .catch((err) => console.error('Error fetching recommended products:', err));
    }
  }, [product]);

  // Handle Add to Cart functionality with toast messages.
  const handleAddToCart = async () => {
    if (!product) return;
    const newCartItem = {
      id: parseInt(product.id),
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    };

    const success = await addToCartLocal(newCartItem, () => {
      router.push('/authScreen');
    });

    if (success) {
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${product.name} has been added to your cart.`,
        position: 'bottom',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Add to Cart Failed',
        text2: 'Please login or try again.',
        position: 'bottom',
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading product...</Text>
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
        <Text style={styles.screenTitle}>Product Details</Text>
        <TouchableOpacity onPress={() => router.push('/cart')}>
          <FontAwesome name="shopping-cart" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Carousel */}
        {product.images && product.images.length > 0 ? (
          <ImageCarousel images={product.images} />
        ) : (
          <Image source={{ uri: product.image }} style={styles.carouselImage} />
        )}

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.productPrice}>₱ {product.price.toFixed(2)}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          <View style={styles.starContainer}>
            {Array.from({ length: 5 }).map((_, index) => (
              <FontAwesome
                key={index}
                name={index < product.rating ? 'star' : 'star-o'}
                size={20}
                color="#FFD700"
              />
            ))}
          </View>
        </View>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <View style={styles.recommendationContainer}>
            <Text style={styles.recommendationTitle}>Recommended Products</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recommendedProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recommendationCard}
                  onPress={() => router.push(`/product/${item.id}`)}
                >
                  <Image source={{ uri: item.image }} style={styles.recommendationImage} />
                  <Text style={styles.recommendationName}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
          <FontAwesome name={isFavorite ? 'heart' : 'heart-o'} size={24} color={isFavorite ? 'red' : 'black'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <FontAwesome name="shopping-cart" size={20} color="#fff" style={styles.cartIcon} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </SafeAreaView>
  );
};

export default ProductDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.05,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  screenTitle: {
    fontSize: screenWidth < 500 ? 20 : 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 140,
  },
  carouselContainer: {
    backgroundColor: '#fff',
  },
  carouselImage: {
    width: screenWidth,
    height: screenWidth * 0.75,
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  detailsContainer: {
    paddingHorizontal: screenWidth * 0.05,
    paddingVertical: 10,
  },
  productTitle: {
    fontSize: screenWidth < 500 ? 26 : 32,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: screenWidth < 500 ? 28 : 32,
    fontWeight: 'bold',
    color: '#E91E63',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: screenWidth < 500 ? 16 : 18,
    color: '#444',
    lineHeight: 24,
    marginBottom: 10,
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  recommendationContainer: {
    paddingHorizontal: screenWidth * 0.05,
    paddingVertical: 10,
  },
  recommendationTitle: {
    fontSize: screenWidth < 500 ? 20 : 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  recommendationCard: {
    marginRight: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    width: screenWidth * 0.4,
    alignItems: 'center',
  },
  recommendationImage: {
    width: '100%',
    height: screenWidth * 0.4,
    resizeMode: 'contain',
    borderRadius: 8,
    marginBottom: 6,
  },
  recommendationName: {
    fontSize: screenWidth < 500 ? 14 : 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: screenWidth * 0.05,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  favoriteButton: {
    backgroundColor: '#fff',
    borderColor: '#000000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  addToCartButton: {
    flexDirection: 'row',
    backgroundColor: '#ff6666',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 10,
  },
  cartIcon: {
    marginRight: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: screenWidth < 500 ? 18 : 20,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: screenWidth < 500 ? 18 : 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: screenWidth < 500 ? 18 : 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
