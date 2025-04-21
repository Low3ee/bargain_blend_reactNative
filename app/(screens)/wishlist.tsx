import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getWishlist, removeFromFavorite } from '@/services/wishlistService';
import Toast from 'react-native-toast-message';

const WishlistScreen: React.FC = () => {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const data = await getWishlist();
      console.log('Fetched wishlist:', data);
      setWishlist(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (id: number) => {
    try {
      await removeFromFavorite(id);
      setWishlist((prev) => prev.filter((item) => item.product.id !== id));
    Toast.show({
      type: 'success',
      text1: 'Removed from wishlist',
      position: 'bottom',
    });
  } catch (error) {
    console.error('Error removing item from wishlist:', error);
    Toast.show({
      type: 'error',
      text1: 'Failed to remove item',
    });
  }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (wishlist.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>Your wishlist is empty.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.product.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.product.images[0].url }} style={styles.image} />
            <View style={styles.details}>
              <Text style={styles.name}>{item.product.name}</Text>
              <Text style={styles.price}>₱{item.product.price}</Text>
              <TouchableOpacity onPress={() => handleRemoveFromWishlist(item.product.id)}>
                <FontAwesome name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
});

export default WishlistScreen;
