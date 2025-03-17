import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, Dimensions, Text } from 'react-native';
import { useRouter } from 'expo-router'; 
import { ThemedView } from '@/components/ThemedView'; 
import category from '@/constants/category.json';

const screenWidth = Dimensions.get('window').width;

const categories = category;

const Explore: React.FC = () => {
  const router = useRouter(); 

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { width: screenWidth * 0.44 }]}
      onPress={() => router.push({
        pathname: "/products/[id]",
        params: { id: item.id }
      })}
    >
      <View style={styles.cardContainer}>
        <Image source={{uri: `${item.image}`}} style={styles.cardImage} resizeMode="contain" />
        <View style={styles.overlay}>
          <Text style={styles.cardTitle}>{item.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.categoryList}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
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
    // elevation: 3, // Adds shadow on Android devices
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
