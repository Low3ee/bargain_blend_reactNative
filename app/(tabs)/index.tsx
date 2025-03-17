import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Text, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';  // Import useRouter for navigation
import productsData from '@/constants/productsData.json';
import Header from '@/components/Header';  // Import the Header component

const ProductsScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const router = useRouter();  // Initialize the router

  useEffect(() => {
    const categoryProducts = productsData.filter((product) => product.categoryId === id);
    setFilteredProducts(categoryProducts);
  }, [id]);

  // Handle search query input and filter products
  const handleSearch = (query: string) => {
    const filtered = productsData.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  // Render product item
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}`)}  // Navigate to the product details page
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{`$${item.price}`}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Use the Header component */}
      <Header onSearch={handleSearch} />

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
    paddingTop: 25,
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
});

export default ProductsScreen;
