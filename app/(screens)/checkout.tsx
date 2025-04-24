import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';

import {
  getCartItems,
  calculateTotalAmountLocal,
  clearCartLocal,
  CartItem,
} from '@/utils/cartStorage';
import { createOrder } from '@/services/orderService';
import AddressModal, { Address } from '@/components/AddressModal';
import { getToken, getUserInfoField } from '@/utils/profileUtil';
import AddressService from '@/services/addressService';

const { width } = Dimensions.get('window');

const CheckoutPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<number>(1);

  const [selectedAddress, setSelectedAddress] = useState<Address['raw'] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    loadCartData();
    loadPrimaryAddress();
  }, []);

  const loadCartData = async () => {
    const items = await getCartItems();
    setCartItems(items);
    setTotalAmount(await calculateTotalAmountLocal());
  };

  const loadPrimaryAddress = async () => {
    setAddressLoading(true);
    try {
      const userId = await getUserInfoField('id');
      if (!userId) {
        setSelectedAddress(null);
        return;
      }
      const all = await AddressService.getAddressesByUserId(Number(userId));
      if (!all?.length) {
        setSelectedAddress(null);
        return;
      }
      const rawPrimary: Address['raw'] =
        all.find((a: Address['raw']) => a.primary === true || a.status === 'PRIMARY') || all[0];
      setSelectedAddress(rawPrimary);
    } catch (err) {
      console.error('Error loading primary address', err);
      setSelectedAddress(null);
    } finally {
      setAddressLoading(false);
    }
  };

  const showToast = (
    type: 'success' | 'error' | 'info',
    title: string,
    message: string
  ) => {
    Toast.show({ type, text1: title, text2: message, position: 'top' });
  };

  const handleCheckout = async () => {
    if (!cartItems.length) {
      return showToast('info', 'Empty Cart', 'Add items before checking out.');
    }
    if (!selectedAddress) {
      return showToast('info', 'Missing Address', 'Please select a shipping address.');
    }

    setLoading(true);
    try {
      const userId = await getUserInfoField('id');
      const token = await getToken();
      if (!userId || !token) {
        return showToast('error', 'Auth Error', 'Please log in again.');
      }

      // **Send productVariantId** instead of productId
      const orderItems = cartItems.map(item => ({
        productVariantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      }));

      await createOrder(
        token,
        String(userId),
        totalAmount,
        paymentMethod,
        selectedAddress.id,
        orderItems
      );

      await clearCartLocal();
      await loadCartData();
      showToast('success', 'Order Placed', 'Your order has been placed!');
      router.push('/');
    } catch (error: any) {
      console.error('Checkout error:', error);
      const msg =
        error?.response?.data?.message || error?.message || 'Checkout failed.';
      showToast('error', 'Error', msg);
    } finally {
      setLoading(false);
      setConfirmVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={styles.title}>Checkout</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Shipping Address</Text>
          {addressLoading ? (
            <ActivityIndicator size="small" color="#D6003A" />
          ) : selectedAddress ? (
            <Text style={styles.addressText}>
              {`${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.zip}, ${selectedAddress.country}`}
            </Text>
          ) : (
            <Text style={styles.addressPlaceholder}>No address selected</Text>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(true)}
            disabled={addressLoading}
          >
            <Text style={styles.buttonText}>
              {selectedAddress ? 'Change Address' : 'Select Address'}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={cartItems}
          keyExtractor={item => item.variantId.toString()}
          style={styles.cartList}
          ListEmptyComponent={<Text style={styles.emptyText}>Your cart is empty.</Text>}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Text style={styles.cartItemText}>{item.name}</Text>
              <Text style={styles.cartItemText}>
                ₱{item.price} × {item.quantity}
              </Text>
            </View>
          )}
        />

        <Text style={styles.totalText}>Total: ₱{totalAmount.toFixed(2)}</Text>

        <Text style={styles.label}>Payment Method</Text>
        {Platform.OS === 'web' ? (
          <select
            value={paymentMethod}
            onChange={e => setPaymentMethod(Number(e.target.value))}
            style={styles.select}
          >
            <option value={1}>Cash on Delivery</option>
            <option value={2} disabled>Gcash (Coming Soon)</option>
            <option value={3}>PayPal</option>
          </select>
        ) : (
          <RNPickerSelect
            onValueChange={v => setPaymentMethod(v)}
            items={[
              { label: 'Cash on Delivery', value: 1 },
              { label: 'Gcash (Coming Soon)', value: 2 },
              { label: 'PayPal', value: 3 },
            ]}
            value={paymentMethod}
            style={{ inputIOS: styles.select, inputAndroid: styles.select }}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerTotal}>Order Amount: ₱{totalAmount.toFixed(2)}</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: loading ? '#888' : '#D6003A' }]}
          onPress={() => setConfirmVisible(true)}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Proceed to Checkout</Text>}
        </TouchableOpacity>
      </View>

      <AddressModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onSelectAddress={addr => {
          setSelectedAddress(addr);
          setModalVisible(false);
        }}
      />

      <ConfirmModal
        visible={confirmVisible}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleCheckout}
      />

      <Toast />
    </View>
  );
};

const ConfirmModal = ({ visible, onCancel, onConfirm }: { visible: boolean; onCancel: () => void; onConfirm: () => void }) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Confirm Checkout</Text>
        <Text style={styles.modalMessage}>Are you sure you want to place this order?</Text>
        <View style={styles.modalButtons}>
          <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={onCancel}>
            <Text style={{ color: '#333' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#D6003A' }]} onPress={onConfirm}>
            <Text style={{ color: '#fff' }}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  section: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 8 },
  addressText: { fontSize: 14, marginBottom: 5 },
  addressPlaceholder: { fontSize: 14, fontStyle: 'italic', color: '#777' },
  button: { backgroundColor: '#D6003A', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', marginTop: 10, minWidth: 150 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  cartList: { marginVertical: 10 },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  cartItemText: { fontSize: 16 },
  emptyText: { textAlign: 'center', fontSize: 16, marginVertical: 20 },
  totalText: { fontSize: 20, fontWeight: 'bold', textAlign: 'right', marginVertical: 10 },
  select: { fontSize: 16, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#fff', borderRadius: 5, borderColor: '#ccc', borderWidth: 1, marginBottom: 20 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 15, borderTopWidth: 1, borderColor: '#eee', alignItems: 'center' },
  footerTotal: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: width * 0.85, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, paddingVertical: 12, marginHorizontal: 5, borderRadius: 8, alignItems: 'center' },
});

export default CheckoutPage;
