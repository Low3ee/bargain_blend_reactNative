import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  Button,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getProducts, Product } from '@/app/services/productService';
import { addToCartLocal, getCartItems, CartItem } from '@/app/utils/cartStorage';
import Header from '@/components/Header';
import SkeletonLoader from '@/components/SkeletonLoader';

const screenWidth = Dimensions.get('window').width;

const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showOutOfStock, setShowOutOfStock] = useState(true);
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
        image: product.image_url,
        quantity: quantityToAdd,
      };

      await addToCartLocal(newCartItem);
      fetchCartItems();
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCartItems();
  }, []);

  const displayedProducts = showOutOfStock
    ? products
    : products.filter(product => product.stock > 0);

  const renderItem = ({ item }: { item: Product }) => {
    const isOutOfStock = item.stock === 0;

    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          isOutOfStock && styles.outOfStockCard,
        ]}
        onPress={() => router.push(`/product/${item.id}`)}
        disabled={isOutOfStock}
      >
        <Image source={{ uri: item.image_url }} style={styles.productImage} />
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{`₱${item.price}`}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>

        {isOutOfStock ? (
          <Text style={styles.outOfStockLabel}>Out of Stock</Text>
        ) : (
          <Button title="Add to Cart" onPress={() => handleAddToCart(item)} />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header onSearch={() => {}} />
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
        <Header onSearch={() => {}} />
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onSearch={() => {}} />

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          onPress={() => setShowOutOfStock(prev => !prev)}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {showOutOfStock ? 'Hide Out of Stock Items' : 'Show Out of Stock Items'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        key={`products-2-${showOutOfStock}`} // ensures FlatList re-renders when toggle changes
        data={displayedProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapperStyle}
      />
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
    borderRadius: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  productPrice: {
    color: 'red',
    fontSize: 14,
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
});

export default ProductsScreen;
