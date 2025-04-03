import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { getCartItems, calculateTotalAmountLocal, checkoutCartLocal, CartItem } from '@/app/utils/cartStorage'; // Local cart storage
import { checkout, syncCartWithBackend } from '@/app/services/cartService'; // Server calls

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('credit_card'); // Default payment method

  // Load cart items and total price on component mount
  useEffect(() => {
    const fetchCart = async () => {
      const items = await getCartItems();
      setCartItems(items);
      setTotalAmount(await calculateTotalAmountLocal());
    };
    fetchCart();
  }, []);

  // Handle checkout process
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Your cart is empty!');
      return;
    }

    const userId = 1; // Replace with actual logged-in user ID

    // Sync local cart with the server before proceeding with checkout
    await syncCartWithBackend(cartItems);

    // Proceed with checkout
    const success = await checkout(userId, paymentMethod);
    if (success) {
      Alert.alert('Success', 'Order placed successfully!');
      setCartItems([]); // Clear local cart state
      setTotalAmount(0);
      checkoutCartLocal(); // Optionally clear cart in local storage as well
    } else {
      Alert.alert('Error', 'Checkout failed. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Checkout</Text>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text style={{ fontSize: 18 }}>{item.name}</Text>
            <Text>Price: ₱{item.price}</Text>
            <Text>Quantity: {item.quantity}</Text>
          </View>
        )}
      />

      {/* Total Price */}
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 10 }}>Total: ₱{totalAmount.toFixed(2)}</Text>

      {/* Payment Method Picker */}
      <Text style={{ fontSize: 16, marginBottom: 5 }}>Select Payment Method:</Text>

      {Platform.OS === 'web' ? (
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={{
            padding: 10,
            borderWidth: 1,
            borderRadius: 5,
            fontSize: 16,
            width: '100%',
          }}
        >
          <option value="credit_card">Credit Card</option>
          <option value="paypal">PayPal</option>
          <option value="cod">Cash on Delivery</option>
        </select>
      ) : (
        <RNPickerSelect
          onValueChange={(value) => setPaymentMethod(value)}
          items={[
            { label: 'Credit Card', value: 'credit_card' },
            { label: 'PayPal', value: 'paypal' },
            { label: 'Cash on Delivery', value: 'cod' },
          ]}
          value={paymentMethod}
        />
      )}

      {/* Checkout Button */}
      <TouchableOpacity
        style={{
          backgroundColor: 'green',
          padding: 15,
          marginTop: 20,
          alignItems: 'center',
          borderRadius: 5,
        }}
        onPress={handleCheckout}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>Place Order</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CheckoutPage;
