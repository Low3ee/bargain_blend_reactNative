import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { IconButton, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getCartItems,
  updateCartItemQuantityLocal,
  removeCartItemLocal,
  clearCartLocal,
  CartItem,
} from '@/app/utils/cartStorage';
import { syncCartWithBackend } from '@/app/services/cartService';
import { getProductStock } from '@/app/services/productService';
import { router } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

type CartItemWithStock = CartItem & { stock: number };

const Cart: React.FC = () => {
  const [items, setItems] = useState<CartItemWithStock[]>([]);

  useEffect(() => {
    (async () => {
      // Load cart items and their stock
      const raw = await getCartItems();
      const withStock = await Promise.all(
        raw.map(async item => {
          const stock = await getProductStock(item.id.toString());
          return { ...item, stock };
        })
      );
      // Auto‑adjust quantities > stock
      const adjusted = withStock.map(item => {
        if (item.quantity > item.stock) {
          updateCartItemQuantityLocal(item.id, item.stock);
          return { ...item, quantity: item.stock };
        }
        return item;
      });
      setItems(adjusted);
    })();
  }, []);

  const updateQuantity = (id: string, type: 'increment' | 'decrement') => {
    setItems(prev =>
      prev.map(item => {
        if (item.id.toString() !== id) return item;
        // If out of stock, do nothing
        if (item.stock === 0) return item;

        const max = item.stock;
        const newQty =
          type === 'increment'
            ? Math.min(item.quantity + 1, max)
            : Math.max(item.quantity - 1, 1);

        if (newQty === item.quantity && type === 'increment') {
          Alert.alert('Max stock reached', `Only ${max} available`);
        }

        updateCartItemQuantityLocal(item.id, newQty);
        return { ...item, quantity: newQty };
      })
    );
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id.toString() !== id));
    removeCartItemLocal(parseInt(id, 10));
  };

  const calculateTotal = () =>
    items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);

  const handleCheckout = async () => {
    if (!items.length) {
      Alert.alert('Your cart is empty!');
      return;
    }
    await syncCartWithBackend(items);
    // clearCartLocal();
    router.push('/checkout');
  };

  const renderItem = ({ item }: { item: CartItemWithStock }) => {
    const outOfStock = item.stock === 0;
    return (
      <View style={[styles.card, outOfStock && styles.outOfStockCard]}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.name}</Text>
          {outOfStock && <Text style={styles.outOfStockText}>Out of Stock</Text>}
          <Text style={styles.price}>₱{item.price}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => updateQuantity(item.id.toString(), 'decrement')}
              disabled={item.quantity <= 1 || outOfStock}
            >
              <MaterialCommunityIcons
                name="minus-circle"
                size={28}
                color={item.quantity <= 1 || outOfStock ? '#ccc' : 'red'}
              />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => updateQuantity(item.id.toString(), 'increment')}
              disabled={item.quantity >= item.stock || outOfStock}
            >
              <MaterialCommunityIcons
                name="plus-circle"
                size={28}
                color={item.quantity >= item.stock || outOfStock ? '#ccc' : 'green'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <IconButton
          icon="trash-can"
          iconColor="red"
          size={28}
          onPress={() => removeItem(item.id.toString())}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={styles.list}
      />
      <View style={styles.footer}>
        <Text style={styles.totalText}>Order Amount: ₱{calculateTotal()}</Text>
        <Button mode="contained" style={styles.checkoutButton} onPress={handleCheckout}>
          Checkout
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { paddingHorizontal: 15, paddingBottom: 80 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  outOfStockCard: {
    opacity: 0.5,
  },
  outOfStockText: {
    color: 'red',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productImage: {
    width: screenWidth * 0.2,
    height: screenWidth * 0.2,
    borderRadius: 5,
  },
  productDetails: { flex: 1, marginLeft: 15 },
  productName: { fontSize: 16, fontWeight: 'bold' },
  price: { color: 'red', fontSize: 16, fontWeight: 'bold' },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quantityText: { fontSize: 18, marginHorizontal: 10 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#D6003A',
    padding: 15,
    alignItems: 'center',
  },
  totalText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  checkoutButton: { backgroundColor: '#fff', marginTop: 10, paddingVertical: 8, width: '90%' },
});

export default Cart;
