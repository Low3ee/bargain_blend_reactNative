import React, { useState } from 'react';
import { StyleSheet, Image, View, SectionList, TouchableOpacity, Dimensions, Text } from 'react-native';
import { IconButton, Card, Title, Paragraph } from 'react-native-paper';
import SearchBar from '@/components/SearchBar';
import { ThemedView } from '@/components/ThemedView';
import productsData from '@/constants/productsData.json';
import category from '@/constants/category.json';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

const products: Product[] = productsData;
const categories: Category[] = category;

const HomeScreen: React.FC = () => {
  // State for managing the expanded sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Group products by category
  const groupedProducts = categories.map(category => {
    const filteredProducts = products.filter(product => product.categoryId === category.id);
    return {
      title: category.name,
      data: filteredProducts,
    };
  });

  // Function to handle section expansion
  const toggleSection = (categoryId: string) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(categoryId)) {
      newExpandedSections.delete(categoryId);
    } else {
      newExpandedSections.add(categoryId);
    }
    setExpandedSections(newExpandedSections);
  };

  // Render each product item
  const renderItem = ({ item }: { item: Product }) => (
    <Card style={[styles.card, { width: screenWidth * 0.44 }]}>
      <Card.Cover source={{ uri: item.image }} style={styles.cardImage} resizeMode="contain" />
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>{item.description}</Paragraph>
        <Paragraph style={styles.price}>${item.price}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <IconButton
          icon="cart-outline"
          iconColor="#000"
          size={24}
          onPress={() => {
            // Action for cart icon press
          }}
          style={styles.cartIcon}
        />
      </Card.Actions>
    </Card>
  );

  // Render the header of each section (category)
  const renderSectionHeader = ({ section }: { section: any }) => (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={() => toggleSection(section.title)}
    >
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
      <MaterialCommunityIcons
        name={expandedSections.has(section.title) ? "chevron-up" : "chevron-down"}
        size={24}
        color="#333"
      />
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={require('@/assets/images/brand-logo.png')} style={styles.logo} />

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <SearchBar />
        </View>

        {/* Cart Icon */}
        <IconButton
          icon="cart-outline"
          iconColor="#000"
          size={30}
          onPress={() => {
            // Action for cart icon press
          }}
          style={styles.cartIcon}
        />
      </View>

      <View style={styles.box}>
        <ThemedText style={styles.welcomeText} type="title">Welcome!</ThemedText>
        <TouchableOpacity>
          <Text style={styles.boxButton}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* SectionList for Expandable Categories */}
      <SectionList
        sections={groupedProducts}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productList}
        stickySectionHeadersEnabled
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    backgroundColor: '#f8f8f8',
  },
  boxButton: {
    padding: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    color: '#333',
    alignSelf: 'center',
  },
  box: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  welcomeText: {
    fontSize: 18,
    color: '#333',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#ff6666',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  cartIcon: {
    marginLeft: 10,
  },
  searchBarContainer: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: 'transparent',
  },
  productList: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  card: {
    marginBottom: 10,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#eee',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default HomeScreen;
