import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, Dimensions, Text } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { useRouter } from 'expo-router'; // Import the router hook to navigate
import { ThemedView } from '@/components/ThemedView'; // Adjust according to your components path
import category from '@/constants/category.json';
const screenWidth = Dimensions.get('window').width;

const categories = category;

const Explore: React.FC = () => {
  const router = useRouter(); // Initialize the router hook

  const renderCategoryItem = ({ item }: { item: any }) => (
    <Card style={[styles.card, { width: screenWidth * 0.44 }]}>
      <Card.Cover source={{ uri: item.image }} style={styles.cardImage} resizeMode='contain' />
      <Card.Content>
        <Title>{item.name}</Title>
      </Card.Content>
      <Card.Actions>
        <TouchableOpacity
          onPress={() => router.push({
            pathname: "/products/[id]",
            params: { id: item.id }
          })}
        >
          <Text style={styles.viewProductsText}>View Products</Text>
        </TouchableOpacity>
      </Card.Actions>
    </Card>
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
  },
  welcomeText: {
    fontSize: 20,
    marginRight: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    marginBottom: 10,
    marginHorizontal: 5,
  },
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  viewProductsText: {
    color: '#007bff',
    fontSize: 16,
  },
});

export default Explore;
