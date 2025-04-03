import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Text, Image, TouchableOpacity, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { getProducts, Product } from '@/app/services/productService';
import { addToCartLocal, getCartItems, CartItem } from '@/app/utils/cartStorage'; // Importing CartItem type and cart services
import Header from '@/components/Header'; 
import SkeletonLoader from '@/components/SkeletonLoader'; 

const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]); // All products
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]); // Explicitly typed as CartItem[]
  const router = useRouter(); 

  // Fetch products from the product service
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProducts = await getProducts(); // Fetch all products
      setProducts(fetchedProducts);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart items from AsyncStorage
  const fetchCartItems = async () => {
    const savedCartItems = await getCartItems(); // Fetch cart items from AsyncStorage
    setCartItems(savedCartItems); // Update cart items state
  };

  // Refresh cart items after a product is added
  const handleAddToCart = async (product: Product) => {
    const newCartItem: CartItem = {
      id: parseInt(product.id),
      name: product.name,
      price: product.price,
      image: product.image_url,
      quantity: 1,
    };

    await addToCartLocal(newCartItem); // Add the product to the cart
    fetchCartItems(); // Refresh cart items
    alert('Product added to cart!');
  };

  // Fetch products and cart items when the component mounts
  useEffect(() => {
    fetchProducts(); // Fetch products from API
    fetchCartItems(); // Fetch cart items from AsyncStorage
  }, []);

  // Render the product item in the list
  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => router.push(`/product/${item.id}`)}>
      <Image source={{ uri: item.image_url }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{`₱${item.price}`}</Text>
      <Text style={styles.productDescription}>{item.description}</Text>
      <Button title="Add to Cart" onPress={() => handleAddToCart(item)} />
    </TouchableOpacity>
  );

  // Render the loading skeleton while the data is being fetched
  if (loading) {
    return (
      <View style={styles.container}>
        <Header onSearch={() => {}} />
        <FlatList data={[...Array(10)]} renderItem={() => <SkeletonLoader />} keyExtractor={(item, index) => String(index)} />
      </View>
    );
  }

  // Render error message if fetching products fails
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
      <FlatList data={products} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  productCard: { margin: 15, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 8 },
  productImage: { width: 100, height: 100, borderRadius: 8 },
  productName: { fontSize: 16, fontWeight: 'bold', marginVertical: 5 },
  productPrice: { color: 'red', fontSize: 14 },
  productDescription: { fontSize: 12, color: '#777', marginVertical: 5 },
});

export default ProductsScreen;
