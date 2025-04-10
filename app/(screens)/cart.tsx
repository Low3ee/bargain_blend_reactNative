import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
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
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

type CartItemWithStock = CartItem & { stock: number };

const Cart: React.FC = () => {
  const [items, setItems] = useState<CartItemWithStock[]>([]);

  useEffect(() => {
    (async () => {
      const raw = await getCartItems();
      const withStock = await Promise.all(
        raw.map(async item => {
          const stock = await getProductStock(item.id.toString());
          return { ...item, stock };
        })
      );
      const adjusted = withStock.map(item => {
        if (item.quantity > item.stock) {
          updateCartItemQuantityLocal(item.id, item.stock);
          Toast.show({
            type: 'info',
            text1: 'Stock Adjusted',
            text2: `Updated quantity for ${item.name} to available stock.`,
          });
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
        if (item.stock === 0) return item;

        const max = item.stock;
        const newQty =
          type === 'increment'
            ? Math.min(item.quantity + 1, max)
            : Math.max(item.quantity - 1, 1);

        if (newQty === item.quantity && type === 'increment') {
          Toast.show({
            type: 'info',
            text1: 'Max stock reached',
            text2: `Only ${max} available.`,
          });
        }

        updateCartItemQuantityLocal(item.id, newQty);
        return { ...item, quantity: newQty };
      })
    );
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id.toString() !== id));
    removeCartItemLocal(parseInt(id, 10));
    Toast.show({
      type: 'success',
      text1: 'Removed',
      text2: 'Item removed from cart.',
    });
  };

  const calculateTotal = () =>
    items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);

  const handleCheckout = async () => {
    if (!items.length) {
      Toast.show({
        type: 'error',
        text1: 'Your cart is empty!',
      });
      return;
    }

    try {
      await syncCartWithBackend(items);
      router.push('/checkout');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Checkout Failed',
        text2: 'Something went wrong. Try again.',
      });
    }
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
                color={item.quantity <= 1 || outOfStock ? '#ccc' : '#D6003A'}
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
                color={item.quantity >= item.stock || outOfStock ? '#ccc' : '#198754'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <IconButton
          icon="trash-can"
          iconColor="#dc3545"
          size={28}
          onPress={() => removeItem(item.id.toString())}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {items.length > 0 ? (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={i => i.id.toString()}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.linkText}>Go back to shopping</Text>
          </TouchableOpacity>
        </View>
      )}

      {items.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.totalText}>Order Amount: ₱{calculateTotal()}</Text>
          <Button mode="contained" style={styles.checkoutButton} onPress={handleCheckout}>
            Checkout
          </Button>
        </View>
      )}

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { paddingHorizontal: 15, paddingBottom: 80 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
  },
  outOfStockCard: {
    opacity: 0.5,
  },
  outOfStockText: {
    color: '#dc3545',
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
  price: { color: '#D6003A', fontSize: 16, fontWeight: 'bold' },
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
  checkoutButton: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 8,
    width: '90%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  linkText: {
    fontSize: 16,
    color: '#D6003A',
    textDecorationLine: 'underline',
  },
});

export default Cart;
