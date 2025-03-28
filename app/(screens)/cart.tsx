import React, { useState } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { IconButton, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

const cartItems: CartItem[] = [
  { id: '1', name: 'Black Anime T-Shirt', price: '59', image: 'https://example.com/tshirt.jpg', quantity: 1 },
  { id: '2', name: 'Vintage Plaid Shirt', price: '59', image: 'https://example.com/plaid.jpg', quantity: 1 },
  { id: '3', name: 'Red Shorts', price: '59', image: 'https://example.com/shorts.jpg', quantity: 1 },
];

const Cart: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>(cartItems);

  const updateQuantity = (id: string, type: 'increment' | 'decrement') => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: type === 'increment' ? item.quantity + 1 : Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const calculateTotal = (): string => {
    return items.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0).toFixed(2);
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.price}>₱{item.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => updateQuantity(item.id, 'decrement')}>
            <MaterialCommunityIcons name="minus-circle" size={28} color="red" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => updateQuantity(item.id, 'increment')}>
            <MaterialCommunityIcons name="plus-circle" size={28} color="green" />
          </TouchableOpacity>
        </View>
      </View>
      <IconButton icon="trash-can" iconColor="red" size={28} onPress={() => removeItem(item.id)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList data={items} renderItem={renderItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} />
      <View style={styles.footer}>
        <Text style={styles.totalText}>Order Amount: ₱{calculateTotal()}</Text>
        <Button mode="contained" style={styles.checkoutButton} onPress={() => {}}>
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
