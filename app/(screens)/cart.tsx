// src/screens/Cart.tsx
import React, { useEffect, useState } from 'react';
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
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import {
  getCartItems,
  updateCartItemQuantityLocal,
  removeCartItemLocal,
} from '@/utils/cartStorage';
import { syncCartWithBackend } from '@/services/cartService';
import { getProductStock } from '@/services/productService';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import { getProfileDetails } from '@/utils/profileUtil';

const screenWidth = Dimensions.get('window').width;

type CartItemWithStock = {
  id: string;
  productId: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variantId: number;
  size?: string;
  color?: string;
  stock: number;
};

const Cart: React.FC = () => {
  const [items, setItems] = useState<CartItemWithStock[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      const isLoggedIn = await getProfileDetails();
      if (!isLoggedIn) {
        Toast.show({
          type: 'error',
          text1: 'Login Required',
          text2: 'Please log in to view your cart.',
        });
        router.push('/authScreen');
        return;
      }
  
      const raw = await getCartItems(); // contains id
      const withStock = await Promise.all(
        raw.map(async item => ({
          ...item,
          stock: await getProductStock(item.variantId.toString()),
        }))
      );
  
      const adjusted = await Promise.all(
        withStock.map(async item => {
          if (item.quantity > item.stock) {
            await updateCartItemQuantityLocal(item.variantId, item.stock);
            Toast.show({
              type: 'info',
              text1: 'Stock Adjusted',
              text2: `${item.name} quantity reduced to available stock.`,
            });
            return { ...item, quantity: item.stock };
          }
          return item;
        })
      );
  
      console.log("adjusted cart items:", adjusted);
      setItems(adjusted);
      setSelectedVariants(adjusted.filter(i => i.stock > 0).map(i => i.variantId));
    })();
  }, []);
  
  

  const toggleSelectVariant = (variantId: number) => {
    setSelectedVariants(prev =>
      prev.includes(variantId)
        ? prev.filter(id => id !== variantId)
        : [...prev, variantId]
    );
  };

  const updateQuantity = (variantId: number, type: 'inc' | 'dec') => {
    setItems(prev =>
      prev.map(item => {
        if (item.variantId !== variantId) return item;
  
        const max = item.stock;
        const currentQty = Number(item.quantity) || 1;
        const newQty =
          type === 'inc'
            ? Math.min(currentQty + 1, max)
            : Math.max(currentQty - 1, 1);
  
        if (newQty !== currentQty) {
          updateCartItemQuantityLocal(variantId, newQty);
        } else if (type === 'inc') {
          Toast.show({
            type: 'info',
            text1: 'Max stock reached',
            text2: `Only ${max} available.`,
          });
        }
  
        return { ...item, quantity: newQty };
      })
    );
  };
  
  const removeItem = async (variantId: number) => {
    await removeCartItemLocal(variantId);
    setItems(prev => prev.filter(i => i.variantId !== variantId));
    setSelectedVariants(prev => prev.filter(id => id !== variantId));
    Toast.show({ type: 'success', text1: 'Removed', text2: 'Item removed from cart.' });
  };

  const calculateTotal = (data: CartItemWithStock[]) =>
    data.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);

  const handleCheckout = async (useSelected: boolean) => {
    const toCheckout = useSelected
      ? items.filter(i => selectedVariants.includes(i.variantId) && i.stock > 0)
      : items.filter(i => i.stock > 0);

    if (!toCheckout.length) {
      Toast.show({
        type: 'error',
        text1: useSelected ? 'No items selected' : 'Cart is empty',
      });
      return;
    }

    try {
      await syncCartWithBackend(
        toCheckout.map(i => ({
          id: i.id,
          productId: i.productId,
          variantId: i.variantId,
          name: i.name,
          image: i.image,
          quantity: i.quantity,
          price: i.price,
        }))
      );
      router.push('/checkout');
    } catch {
      Toast.show({ type: 'error', text1: 'Checkout Failed', text2: 'Try again later.' });
    }
  };

  const renderHeader = () => (
    <View style={styles.selectionHeader}>
      <TouchableOpacity
        onPress={() =>
          setSelectedVariants(items.filter(i => i.stock > 0).map(i => i.variantId))
        }
      >
        <Text style={styles.selectionText}>Select All</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setSelectedVariants([])}>
        <Text style={styles.selectionText}>Clear All</Text>
      </TouchableOpacity>
      <Text style={styles.selectionText}>{selectedVariants.length} Selected</Text>
    </View>
  );

  const renderItem = ({ item }: { item: CartItemWithStock }) => {
    const outOfStock = item.stock === 0;
    return (
      <View style={[styles.card, outOfStock && styles.outOfStockCard]}>
        <View style={styles.selectionWrapper}>
          {outOfStock ? (
            <Text style={styles.unavailableText}>Unavailable</Text>
          ) : (
            <TouchableOpacity onPress={() => toggleSelectVariant(item.variantId)}>
              <FontAwesome
                name={selectedVariants.includes(item.variantId) ? 'check-square' : 'square-o'}
                size={24}
                color="#D6003A"
              />
            </TouchableOpacity>
          )}
        </View>

        <Image source={{ uri: item.image }} style={styles.productImage} />

        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.name}</Text>
          {outOfStock && <Text style={styles.outOfStockText}>Out of Stock</Text>}
          <Text style={styles.price}>₱{item.price}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => updateQuantity(item.variantId, 'dec')}
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
              onPress={() => updateQuantity(item.variantId, 'inc')}
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
          onPress={() => removeItem(item.variantId)}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {items.length ? (
        <>
          <FlatList
            data={items}
            keyExtractor={item => item.variantId.toString()}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.list}
          />
          <View style={styles.footer}>
            <Text style={styles.totalText}>Total: ₱{calculateTotal(items)}</Text>
            <View style={styles.checkoutButtonsContainer}>
              <Button
                mode="contained"
                onPress={() => handleCheckout(true)}
                style={styles.checkoutButton}
                textColor="#DD2222"
              >
                Checkout Selected
              </Button>
              <Button
                mode="contained"
                onPress={() => handleCheckout(false)}
                style={styles.checkoutButton}
                textColor="#DD2222"
              >
                Checkout All
              </Button>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.linkText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      )}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { paddingHorizontal: 15, paddingBottom: 80 },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectionText: { fontSize: 16, color: '#333' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
  },
  outOfStockCard: { opacity: 0.5 },
  selectionWrapper: { marginRight: 10 },
  unavailableText: { fontSize: 16, color: '#ccc', marginRight: 10 },
  productImage: {
    width: screenWidth * 0.2,
    height: screenWidth * 0.2,
    borderRadius: 5,
  },
  productDetails: { flex: 1, marginLeft: 15 },
  productName: { fontSize: 16, fontWeight: 'bold' },
  price: { color: '#D6003A', fontSize: 16, fontWeight: 'bold' },
  outOfStockText: {
    color: '#dc3545',
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 14,
  },
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
  checkoutButtonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-evenly',
    width: '100%',
  },
  checkoutButton: { backgroundColor: '#fff', paddingVertical: 8, width: '45%' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  linkText: { fontSize: 16, color: '#DD2222', textDecorationLine: 'underline' },
});

export default Cart;
