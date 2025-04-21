import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Text, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getProductsByCategory, Product } from '@/services/productService';
import Header from '@/components/Header';
import SkeletonLoader from '@/components/SkeletonLoader';

const ProductsScreen: React.FC = () => {
  const { id } = useLocalSearchParams(); // Get category ID from params
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]); // All products for the category
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); // Filtered products for search
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch products by category
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);  // Clear previous errors
    try {
      const fetchedProducts = await getProductsByCategory(id.toString()); // Fetch products by category ID
      setProducts(fetchedProducts);  // Set all products state
      setFilteredProducts(fetchedProducts);  // Initialize filtered products with all fetched products
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(); // Fetch products when the component mounts
  }, [id]);

  // Function to handle search input
  const handleSearch = (query: string) => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) // Case-insensitive search
    );
    setFilteredProducts(filtered); // Update filtered products
  };

  // Render each product item
  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}`)} // Navigate to product details screen
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{`$${item.price}`}</Text>
    </TouchableOpacity>
  );

  // If loading, show skeleton loading screen
  if (loading) {
    return (
      <View style={styles.container}>
        <Header onSearch={handleSearch} />
        <FlatList
          data={[...Array(10)]} // Simulate skeleton loaders
          renderItem={() => <SkeletonLoader />}
          keyExtractor={(item, index) => String(index)}
          contentContainerStyle={styles.productList}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      </View>
    );
  }

  // If error, show error message with refresh button
  if (error) {
    return (
      <View style={styles.container}>
        <Header onSearch={handleSearch} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchProducts}>
          <Text style={styles.refreshButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Handle empty list gracefully
  if (filteredProducts.length === 0) {
    return (
      <View style={styles.container}>
        <Header onSearch={handleSearch} />
        <Text style={styles.errorText}>No products found.</Text>
      </View>
    );
  }

  // Main content: Render filtered products
  return (
    <View style={styles.container}>
      <Header onSearch={handleSearch} />
      <FlatList
        data={filteredProducts} // Use filtered products for search results
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.productList}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  productList: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: '48%',
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#333',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductsScreen;
