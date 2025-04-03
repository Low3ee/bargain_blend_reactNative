import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { IconButton, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getCartItems, addToCartLocal, updateCartItemQuantityLocal, removeCartItemLocal, clearCartLocal, CartItem } from '@/app/utils/cartStorage'; // Local cart storage
import { syncCartWithBackend, checkoutCart } from '@/app/services/cartService'; // Server sync and checkout
import { router } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

const Cart: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Fetch cart items asynchronously on component mount
  useEffect(() => {
    const fetchCartItems = async () => {
      const fetchedCartItems = await getCartItems(); // Await the async call to fetch cart items
      setItems(fetchedCartItems); // Update state with fetched cart items
    };
    
    fetchCartItems(); // Call the function to fetch cart items
  }, []);

  // Function to update the quantity of an item
  const updateQuantity = (id: string, type: 'increment' | 'decrement') => {
    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id.toString() === id
          ? {
              ...item,
              quantity: type === 'increment' ? item.quantity + 1 : Math.max(1, item.quantity - 1),
            }
          : item
      );
      // Update cart in AsyncStorage
      updatedItems.forEach(item => updateCartItemQuantityLocal(item.id, item.quantity));
      return updatedItems;
    });
  };

  // Function to remove an item from the cart
  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id.toString() !== id));
    removeCartItemLocal(parseInt(id)); // Remove from AsyncStorage
  };

  // Function to calculate the total price of all items in the cart
  const calculateTotal = (): string => {
    return items.reduce((acc, item) => acc + parseFloat(item.price.toString()) * item.quantity, 0).toFixed(2);
  };

  // Function to render each cart item
  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.price}>₱{item.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => updateQuantity(item.id.toString(), 'decrement')}>
            <MaterialCommunityIcons name="minus-circle" size={28} color="red" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => updateQuantity(item.id.toString(), 'increment')}>
            <MaterialCommunityIcons name="plus-circle" size={28} color="green" />
          </TouchableOpacity>
        </View>
      </View>
      <IconButton icon="trash-can" iconColor="red" size={28} onPress={() => removeItem(item.id.toString())} />
    </View>
  );

  // Handle checkout action (e.g., navigate to checkout screen)
  const handleCheckout = async () => {
    // Sync local cart with backend before checkout
    await syncCartWithBackend(items);
    // Optionally clear the cart after checkout
    // await clearCartLocal();
    router.push('/checkout');
  };
  
  return (
    <View style={styles.container}>
      <FlatList data={items} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.list} />
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
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', padding: 10, marginVertical: 5, borderRadius: 10 },
  productImage: { width: screenWidth * 0.2, height: screenWidth * 0.2, borderRadius: 5 },
  productDetails: { flex: 1, marginLeft: 15 },
  productName: { fontSize: 16, fontWeight: 'bold' },
  price: { color: 'red', fontSize: 16, fontWeight: 'bold' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  quantityText: { fontSize: 18, marginHorizontal: 10 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#D6003A', padding: 15, alignItems: 'center' },
  totalText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  checkoutButton: { backgroundColor: '#fff', marginTop: 10, paddingVertical: 8, width: '90%' },
});

export default Cart;
