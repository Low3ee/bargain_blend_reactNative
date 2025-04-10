import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Alert 
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { getProduct } from '@/app/services/productService';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { addToCartLocal, getCartItems, CartItem } from '@/app/utils/cartStorage';
import { getToken } from '@/app/utils/profileUtil';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  condition?: string;
  rating?: number;
}

const ProductDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams(); // Get product ID from URL params
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Handle loading state
  const [error, setError] = useState<string | null>(null); // Handle error state
  const router = useRouter(); // Hook for navigation

  // Check if user is authenticated (modify according to your storage method)
  const isAuthenticated = Boolean(getToken);

  // Fetch product data on mount
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const productData = await getProduct(id.toString());
        console.log("data received", productData);
        setProduct(productData);
      } catch (err) {
        setError('Failed to fetch product details');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <Text style={styles.loadingText}>Loading...</Text>;
  if (error) return <Text style={styles.errorText}>{error}</Text>;
  if (!product) return <Text style={styles.errorText}>Product not found.</Text>;

  // Calculate full and half stars based on product rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesome key={`full-${i}`} name="star" size={16} color="#FFD700" />);
    }
    if (hasHalfStar) {
      stars.push(<FontAwesome key="half" name="star-half-full" size={16} color="#FFD700" />);
    }
    return stars;
  };

  // Handle add to favorites action
  const handleAddToFavorites = () => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'You need to be logged in to add to favorites.', [
        { text: 'Login', onPress: () => router.push('/authScreen') },
        { text: 'Cancel' },
      ]);
      return;
    }
    Alert.alert('Added to Favorites');
  };

  // Handle add to cart action
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'You need to be logged in to add to cart.', [
        { text: 'Login', onPress: () => router.push('/authScreen') },
        { text: 'Cancel' },
      ]);
      return;
    }

    try {
      // Prepare a cart item based on the current product
      const newCartItem: CartItem = {
        id: parseInt(product.id),
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      };

      // Call addToCartLocal; if user is not logged in, a callback can trigger a login modal if needed.
      const success = await addToCartLocal(newCartItem, () => { /* optional: show login modal */ });

      if (success) {
        // Optionally, update local cart state by calling getCartItems() after adding
        Toast.show({
          type: 'success',
          text1: 'Added to Cart',
          text2: `${product.name} has been added.`,
          position: 'bottom',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Add to Cart Failed',
          text2: 'Something went wrong.',
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Add to Cart Failed',
        text2: 'Something went wrong.',
        position: 'bottom',
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <Image source={{ uri: product.image }} style={styles.productImage} />

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.productCondition}>{product.condition || 'Used - Good'}</Text>
          <Text style={styles.productPrice}>{`₱${product.price.toFixed(2)}`}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>

          {/* Star Ratings */}
          <View style={styles.starContainer}>
            {product.rating ? renderStars(product.rating) : null}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.favoriteButton} onPress={handleAddToFavorites}>
          <FontAwesome name="heart" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <FontAwesome name="shopping-cart" size={18} color="white" style={styles.cartIcon} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Toast container (if not rendered globally) */}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  scrollContent: { paddingBottom: 100 },
  loadingText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 20 },
  errorText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: 'red', marginTop: 20 },
  productImage: {
    width: screenWidth,
    height: screenHeight * 0.4,
    resizeMode: 'cover',
  },
  detailsContainer: { paddingHorizontal: 20, paddingVertical: 10 },
  productTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  productCondition: { fontSize: 14, color: '#666', marginBottom: 10 },
  productPrice: { fontSize: 24, fontWeight: 'bold', color: '#E91E63', marginBottom: 10 },
  productDescription: { fontSize: 14, color: '#666', marginBottom: 10, lineHeight: 20 },
  starContainer: { flexDirection: 'row', marginBottom: 15 },
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
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  favoriteButton: {
    backgroundColor: '#ff6666',
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
  cartIcon: { marginRight: 8 },
  addToCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ProductDetailsScreen;
