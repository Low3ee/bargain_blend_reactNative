import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Platform, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { getCartItems, calculateTotalAmountLocal, checkoutCartLocal, CartItem } from '@/app/utils/cartStorage';
import { checkout, syncCartWithBackend } from '@/app/services/cartService';
import { createOrder } from '@/app/services/orderService';  // Import the createOrder function
import AddressModal, { Address } from '@/components/AddressModal';
import { getDetails, getProfileDetails } from '../utils/profileUtil';

const CheckoutPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [selectedAddress, setSelectedAddress] = useState<Address['raw'] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);  // Loading state for the checkout button

  useEffect(() => {
    (async () => {
      const items = await getCartItems();
      setCartItems(items);
      setTotalAmount(await calculateTotalAmountLocal());
    })();
  }, []);

  // Handle Checkout Button Press
  const handleCheckout = async () => {
    console.log('clicked');
    if (cartItems.length === 0) {
      return Alert.alert('Your cart is empty!');
    }
    if (!selectedAddress) {
      return Alert.alert('Please select a shipping address.');
    }
  
    setLoading(true);  // Set loading state to true while the order is being processed
  
    try {
      // Fetch user profile details using getDetails
      const profile = await getDetails();
  
      // Check if profile is null or doesn't contain the expected structure
      if (!profile || !profile.id || !profile.token) {
        return Alert.alert('Error', 'Profile not found or invalid. Please login again.');
      }
  
      const userId = profile.id;  // Extract userId from the profile
      const token = profile.token; // Extract token from the profile
  
      // Sync local cart
      await syncCartWithBackend(cartItems);
  
      // Prepare order items for backend (ensure correct structure here)
      const orderItems = cartItems.map(item => ({
        productId: item.id,    // Assuming item.id corresponds to productId
        quantity: item.quantity,
        price: item.price,
      }));
  
      // Create order in the backend
      const order = await createOrder(token, userId, totalAmount, orderItems);
  
      console.log(userId, token, totalAmount, orderItems);
  
      // If order creation is successful
      Alert.alert('Success', 'Order placed successfully!');
  
      // Clear cart and reset state

    } catch (error) {
      console.error('Checkout failed:', error);
      Alert.alert('Error', 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);  // Reset loading state after API call
    }
  };
  
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      {/* Shipping Address */}
      <View style={styles.section}>
        <Text style={styles.label}>Shipping Address:</Text>
        {selectedAddress ? (
          <Text style={styles.addressText}>
            {`${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.zip}, ${selectedAddress.country}`}
          </Text>
        ) : (
          <Text style={styles.addressPlaceholder}>No address selected</Text>
        )}
        <TouchableOpacity style={styles.addressButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addressButtonText}>{selectedAddress ? 'Change Address' : 'Select Address'}</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        style={styles.cartList}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Text style={styles.cartItemText}>{item.name}</Text>
            <Text style={styles.cartItemText}>₱{item.price} × {item.quantity}</Text>
          </View>
        )}
      />

      {/* Total */}
      <Text style={styles.totalText}>Total: ₱{totalAmount.toFixed(2)}</Text>

      {/* Payment Method */}
      <Text style={styles.label}>Payment Method:</Text>
      {Platform.OS === 'web' ? (
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={styles.select}>
          <option value="credit_card" disabled>Credit Card (Soon)</option>
          <option value="paypal">PayPal</option>
          <option value="cod">Cash on Delivery</option>
        </select>
      ) : (
        <RNPickerSelect
          onValueChange={value => setPaymentMethod(value)}
          items={[
            { label: 'Credit Card (Soon)', value: 'credit_card' },
            { label: 'PayPal', value: 'paypal' },
            { label: 'Cash on Delivery', value: 'cod' },
          ]}
          value={paymentMethod}
        />
      )}

      {/* Place Order */}
      <TouchableOpacity 
  style={[styles.checkoutButton, loading && { backgroundColor: 'gray' }]} 
  onPress={handleCheckout} 
  disabled={loading}
>
  <Text style={styles.checkoutButtonText}>{loading ? 'Processing...' : 'Place Order'}</Text>
</TouchableOpacity>

      {/* Address Modal */}
      <AddressModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onSelectAddress={addr => setSelectedAddress(addr)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  section: { marginVertical: 10 },
  label: { fontSize: 16, marginBottom: 5 },
  addressText: { fontSize: 14, marginBottom: 5 },
  addressPlaceholder: { fontSize: 14, fontStyle: 'italic', color: '#777', marginBottom: 5 },
  addressButton: { backgroundColor: '#DD2222', padding: 10, borderRadius: 5, alignItems: 'center' },
  addressButtonText: { color: '#fff', fontSize: 16 },
  cartList: { marginVertical: 10 },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  cartItemText: { fontSize: 16 },
  totalText: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  select: { padding: 10, borderWidth: 1, borderRadius: 5, fontSize: 16, width: '100%' },
  checkoutButton: { backgroundColor: 'green', padding: 15, alignItems: 'center', borderRadius: 5, marginTop: 20 },
  checkoutButtonText: { color: '#fff', fontSize: 18 },
});

export default CheckoutPage;
