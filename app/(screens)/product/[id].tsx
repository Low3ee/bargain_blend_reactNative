import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { getProduct } from '@/app/services/productService'; // Import your product service

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

// Updated interface where price is a number
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;  // price is now a number
  image?: string;
  condition?: string;
  rating?: number;
}

const ProductDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams(); // Get product ID from URL params
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Handle loading state
  const [error, setError] = useState<string | null>(null); // Handle error state

  useEffect(() => {
    // Fetch the product by ID when the component mounts
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const productData = await getProduct(id.toString()); // Fetch product data from API
        setProduct(productData); // No need to convert price now
      } catch (err) {
        setError('Failed to fetch product details');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct(); // Call the fetchProduct function
  }, [id]);

  if (loading) return <Text style={styles.loadingText}>Loading...</Text>; // Show loading text
  if (error) return <Text style={styles.errorText}>{error}</Text>; // Show error message if any

  if (!product) return <Text style={styles.errorText}>Product not found.</Text>; // If no product found, show message

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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <Image source={{ uri: product.image }} style={styles.productImage} />

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.productCondition}>{product.condition || 'Used - Good'}</Text>
          <Text style={styles.productPrice}>{`₱${product.price.toFixed(2)}`}</Text> {/* Use toFixed for decimal format */}
          <Text style={styles.productDescription}>{product.description}</Text>

          {/* Star Ratings */}
          <View style={styles.starContainer}>
            {product.rating ? renderStars(product.rating) : null}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.favoriteButton} onPress={() => alert('Added to Favorites')}>
          <FontAwesome name="heart" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addToCartButton} onPress={() => alert('Added to Cart')}>
          <FontAwesome name="shopping-cart" size={18} color="white" style={styles.cartIcon} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  scrollContent: { paddingBottom: 100 }, // Prevents cutoff due to bottom buttons
  loadingText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 20 },
  errorText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: 'red', marginTop: 20 },
  productImage: {
    width: screenWidth,
    height: screenHeight * 0.4, // 40% of screen height
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
