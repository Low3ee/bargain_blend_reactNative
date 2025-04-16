import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { getProducts, Product } from '@/app/services/productService';
import { addToCartLocal, getCartItems, CartItem } from '@/app/utils/cartStorage';
import Header from '@/components/Header';
import SkeletonLoader from '@/components/SkeletonLoader';
import LoginRequiredModal from '@/components/LogInRequiredModal';

const screenWidth = Dimensions.get('window').width;

interface ImageItem {
  url: string;
  altText?: string;
  order: number;
}

// A simple inline carousel for images using FlatList
const ImageCarousel: React.FC<{ images: ImageItem[]; style?: any }> = ({ images, style }) => {
  return (
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
};

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
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    const savedCartItems = await getCartItems();
    setCartItems(savedCartItems);
  };

  const handleAddToCart = async (product: Product) => {
    const quantityToAdd = product.stock > 0 ? 1 : 0;

    if (quantityToAdd > 0) {
      const newCartItem: CartItem = {
        id: parseInt(product.id),
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantityToAdd,
      };

      const success = await addToCartLocal(newCartItem, () => setShowLoginModal(true));

      if (success) {
        fetchCartItems();
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
          text2: 'Unable to add product to cart.',
          position: 'bottom',
        });
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Out of Stock',
        text2: 'This product is out of stock.',
        position: 'bottom',
      });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCartItems();
  }, []);

  // Filter products based on the out-of-stock toggle
  const availableProducts = showOutOfStock
    ? products
    : products.filter((product) => product.stock > 0);

  // When the search query is non-empty, filter products by name or description.
  const filteredProducts = searchQuery.trim()
    ? availableProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableProducts;

  // Recommended products, for example, the top 4 by rating
  const recommendedProducts = searchQuery.trim()
    ? [...filteredProducts]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4)
    : [];

    const renderItem = ({ item }: { item: Product }) => {
      const isOutOfStock = item.stock === 0;
    
      return (
        <TouchableOpacity
          style={[styles.productCard, isOutOfStock && styles.outOfStockCard]}
          onPress={() => router.push(`/product/${item.id}`)}
          disabled={isOutOfStock}
        >
          <Image source={{ uri: item.image }} style={styles.productImage} />
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>{`₱${item.price}`}</Text>
          <Text style={styles.productRating}>⭐ {item.rating?.toFixed(1) || 'N/A'}</Text>
          {isOutOfStock && <Text style={styles.outOfStockLabel}>Out of Stock</Text>}
        </TouchableOpacity>
      );
    };
    
  const renderRecommendedItem = ({ item }: { item: Product }) => {
    return (
      <TouchableOpacity
        style={styles.recommendationCard}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        {item.images && item.images.length > 1 ? (
          <ImageCarousel images={item.images} style={styles.recommendationImage} />
        ) : (
          <Image source={{ uri: item.image }} style={styles.recommendationImage} />
        )}
        <Text style={styles.recommendationName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header onSearch={(query) => setSearchQuery(query)} />
        <FlatList
          data={[...Array(10)]}
          renderItem={() => <SkeletonLoader />}
          keyExtractor={(item, index) => String(index)}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header onSearch={(query) => setSearchQuery(query)} />
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onSearch={(query) => setSearchQuery(query)} />
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowOutOfStock(prev => !prev)}
        >
          <Text style={styles.toggleText}>
            {showOutOfStock ? 'Hide' : 'Show'} Out of Stock Products
          </Text>
        </TouchableOpacity>
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
          />
        </View>
      )}
      <FlatList
        key={`products-2-${showOutOfStock}`} // ensures re-render when toggle changes
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapperStyle}
      />
      <LoginRequiredModal visible={showLoginModal} onDismiss={() => setShowLoginModal(false)} />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  columnWrapperStyle: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  productCard: {
    flex: 0.48,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode:"contain",
    borderRadius: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  productPrice: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: 12,
    color: '#777',
    marginVertical: 5,
  },
  outOfStockCard: {
    opacity: 0.5,
  },
  outOfStockLabel: {
    color: '#888',
    fontStyle: 'italic',
    marginTop: 5,
  },
  toggleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'flex-end',
  },
  toggleButton: {
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 14,
    color: '#333',
  },
  recommendationContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  recommendationCard: {
    marginRight: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
    width: screenWidth * 0.4,
    alignItems: 'center',
  },
  recommendationImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  recommendationName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  productRating: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  
});

export default ProductsScreen;
