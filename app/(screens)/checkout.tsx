import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Toast from 'react-native-toast-message';

import { getCartItems, calculateTotalAmountLocal, clearCartLocal, CartItem } from '@/app/utils/cartStorage';
import { createOrder } from '@/app/services/orderService';
import AddressModal, { Address } from '@/components/AddressModal';
import { getToken, getUserInfoField } from '../utils/profileUtil';
import { router } from 'expo-router';

const CheckoutPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [selectedAddress, setSelectedAddress] = useState<Address['raw'] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCartData();
  }, []);

  const loadCartData = async () => {
    const items = await getCartItems();
    setCartItems(items);
    setTotalAmount(await calculateTotalAmountLocal());
  };

  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    Toast.show({
      type,
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
    });
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      return showToast('info', 'Empty Cart', 'Please add items to your cart before checking out.');
    }

    if (!selectedAddress) {
      return showToast('info', 'Missing Address', 'Please select a shipping address.');
    }

    setLoading(true);

    try {
      const userId = await getUserInfoField('id');
      const token = await getToken();

      if (!userId || !token) {
        return showToast('error', 'Authentication Error', 'Please log in again to complete your order.');
      }

      const orderItems = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const order = await createOrder(token, userId, totalAmount, orderItems);

      // Clear local cart
      await clearCartLocal();
      await loadCartData();

      showToast('success', 'Order Placed', 'Your order has been placed successfully!');
      router.push('/');
    } catch (error: any) {
      console.error('Checkout error:', error);
      const errorMessage =
        typeof error === 'string'
          ? error
          : error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';

      showToast('error', 'Checkout Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      {/* Shipping Address */}
      <View style={styles.section}>
        <Text style={styles.label}>Shipping Address</Text>
        {selectedAddress ? (
          <Text style={styles.addressText}>
            {`${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.zip}, ${selectedAddress.country}`}
          </Text>
        ) : (
          <Text style={styles.addressPlaceholder}>No address selected</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>{selectedAddress ? 'Change Address' : 'Select Address'}</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        style={styles.cartList}
        ListEmptyComponent={<Text style={styles.emptyText}>Your cart is empty.</Text>}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Text style={styles.cartItemText}>{item.name}</Text>
            <Text style={styles.cartItemText}>₱{item.price} × {item.quantity}</Text>
          </View>
        )}
      />

      {/* Total Amount */}
      <Text style={styles.totalText}>Total: ₱{totalAmount.toFixed(2)}</Text>

      {/* Payment Method */}
      <Text style={styles.label}>Payment Method</Text>
      {Platform.OS === 'web' ? (
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={styles.select}>
          <option value="credit_card" disabled>Credit Card (Coming Soon)</option>
          <option value="paypal">PayPal</option>
          <option value="cod">Cash on Delivery</option>
        </select>
      ) : (
        <RNPickerSelect
          onValueChange={value => setPaymentMethod(value)}
          items={[
            { label: 'Credit Card (Coming Soon)', value: 'credit_card' },
            { label: 'PayPal', value: 'paypal' },
            { label: 'Cash on Delivery', value: 'cod' },
          ]}
          value={paymentMethod}
          style={{
            inputIOS: styles.select,
            inputAndroid: styles.select,
          }}
        />
      )}

      {/* Place Order Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: loading ? '#888' : '#DD2222' }]}
        onPress={handleCheckout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Place Order</Text>
        )}
      </TouchableOpacity>

      {/* Address Modal */}
      <AddressModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onSelectAddress={(addr) => setSelectedAddress(addr)}
      />

      {/* Toast Container */}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F9F9F9' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  section: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 8 },
  addressText: { fontSize: 14, marginBottom: 5 },
  addressPlaceholder: { fontSize: 14, fontStyle: 'italic', color: '#777' },
  button: { backgroundColor: '#DD2222', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16 },
  cartList: { marginVertical: 10 },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  cartItemText: { fontSize: 16 },
  emptyText: { textAlign: 'center', fontSize: 16, marginVertical: 20 },
  totalText: { fontSize: 20, fontWeight: 'bold', textAlign: 'right', marginVertical: 10 },
  select: { fontSize: 16, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#fff', borderRadius: 5, borderColor: '#ccc', borderWidth: 1 },
});

export default CheckoutPage;
