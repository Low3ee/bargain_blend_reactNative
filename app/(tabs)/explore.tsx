// src/app/screens/Explore.tsx

import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { Category, categoryService } from '@/services/categoryService';

const PRIMARY_RED = '#DD2222';
const WHITE = '#FFFFFF';
const LIGHT_GRAY = '#F5F5F5';

const Explore: React.FC = () => {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch categories once
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch {
        setError('Failed to load categories.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // card width (two per row with spacing)
  const cardWidth = useMemo(() => screenWidth * 0.44, [screenWidth]);

  const renderCategoryItem = ({
    item,
  }: {
    item: Category;
  }) => (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: '/category/[id]',
          params: { id: item.id },
        })
      }
    >
      <Text style={styles.cardTitle}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={PRIMARY_RED} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Explore Categories</Text>
      </View>

      {/* Category Grid */}
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_GRAY,
  },
  headerContainer: {
    paddingVertical: 20,
    backgroundColor: PRIMARY_RED,
    alignItems: 'center',
  },
  headerTitle: {
    color: WHITE,
    fontSize: 22,
    fontWeight: '700',
  },
  listContent: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    height: 120,
    backgroundColor: WHITE,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PRIMARY_RED,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    color: PRIMARY_RED,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  errorText: {
    color: PRIMARY_RED,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Explore;
