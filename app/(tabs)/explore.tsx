import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, Dimensions, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router'; 
import { ThemedView } from '@/components/ThemedView'; 
import { Category, categoryService } from '../services/categoryService';
const screenWidth = Dimensions.get('window').width;

const Explore: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]); // State to hold categories
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch categories from the API when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {

      setLoading(true);
      setError(null);
      try {
        console.log('try block')
        const data = await categoryService.getCategories();
        setCategories(data); // Set fetched categories
      } catch (err) {
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []); // Empty array ensures this effect runs only once when the component mounts

  // Function to render each category item
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[styles.card, { width: screenWidth * 0.44 }]}
      onPress={() => router.push({
        pathname: "/category/[id]",
        params: { id: item.id }
      })}
    >
      <View style={styles.cardContainer}>
        <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.cardImage} resizeMode="contain" />
        <View style={styles.overlay}>
          <Text style={styles.cardTitle}>{item.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Loading or error handling UI
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <Text>{error}</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={require('@/assets/images/brand-logo.png')} style={styles.logo} />
      </View>

      <Text style={styles.welcomeText}>Explore Categories</Text>

      {/* FlatList to Render Categories */}
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.categoryList}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Light background color
  },
  welcomeText: {
    fontSize: 20,
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingVertical: 10,
    backgroundColor: '#ff0000',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  categoryList: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  card: {
    marginBottom: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden', 
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200, // Ensure it looks good on different screen sizes
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent overlay for readability
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Explore;
