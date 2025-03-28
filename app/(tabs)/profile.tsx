// @ts-nocheck

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, Button, TextInput, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';

const ProfileScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [popupContent, setPopupContent] = useState<{ title: string, content: string | JSX.Element }>({ title: '', content: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [addresses, setAddresses] = useState([
    { id: '1', address: '123 Main St, Springfield, IL 62701' },
    { id: '2', address: '456 Oak St, Springfield, IL 62702' },
    { id: '3', address: '789 Pine St, Springfield, IL 62703' },
  ]);

  const openPopup = (content: { title: string, content: string | JSX.Element }) => {
    setPopupContent(content);
    setModalVisible(true);
  };

  const handleAddAddress = () => {
    const newAddressObj = { id: (addresses.length + 1).toString(), address: newAddress };
    setAddresses([...addresses, newAddressObj]);
    setNewAddress('');
    setIsAdding(false);
    setModalVisible(false);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((address) => address.id !== id));
  };

  const handleEditAddress = (id: string) => {
    const addressToEdit = addresses.find((address) => address.id === id);
    setNewAddress(addressToEdit ? addressToEdit.address : '');
    setIsAdding(true);
    setModalVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image source={{ uri: 'https://via.placeholder.com/80' }} style={styles.profileImage} />
        <Text style={styles.userName}>John Doe</Text>
        <FontAwesome name="user-circle" size={24} color="white" style={styles.profileIcon} />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {quickActions.map((action, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.actionButton} 
            onPress={() => action.route ? undefined : openPopup(action.popupContent)}
          >
            {action.route ? (
              <Link href={action.route}> 
                <FontAwesome name={action.icon} size={24} color="white" />
                <Text style={styles.actionText}>{action.label}</Text>
              </Link>
            ) : (
              <>
                <FontAwesome name={action.icon} size={24} color="white" />
                <Text style={styles.actionText}>{action.label}</Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Menu Options */}
      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem} 
            onPress={() => item.route ? undefined : openPopup(item.popupContent)}
          >
            {item.route ? (
              <Link href={item.route}>
                <FontAwesome name={item.icon} size={20} color="red" />
                <Text style={styles.menuText}>{item.label}</Text>
              </Link>
            ) : (
              <>
                <FontAwesome name={item.icon} size={20} color="red" />
                <Text style={styles.menuText}>{item.label}</Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal for Dynamic Pop-up */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{popupContent.title}</Text>
            <View style={styles.modalDescription}>{popupContent.content}</View>

            {/* Address Management */}
            {popupContent.title === 'My Address' && (
              <View style={styles.addressContainer}>
                {!isAdding ? (
                  <>
                    <FlatList
                      data={addresses}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <View style={styles.addressItem}>
                          <Text style={styles.addressText}>{item.address}</Text>
                          <View style={styles.addressActions}>
                            <TouchableOpacity onPress={() => handleEditAddress(item.id)}>
                              <FontAwesome name="edit" size={20} color="#DD2222" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteAddress(item.id)}>
                              <FontAwesome name="trash" size={20} color="#DD2222" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={() => { setIsAdding(true); setModalVisible(true); }}>
                      <Text style={styles.addButtonText}>+ Add Address</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.addressForm}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new address"
                      value={newAddress}
                      onChangeText={setNewAddress}
                    />
                    <Button title="Save Address" onPress={handleAddAddress} color="#DD2222" />
                  </View>
                )}
              </View>
            )}

            <Button title="Close" onPress={() => setModalVisible(false)} color="#DD2222" />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// Mock Data for Quick Actions and Menu Items
const quickActions = [
  { icon: 'shopping-bag', label: 'Orders', route: '/orders' },
  { icon: 'shopping-cart', label: 'Cart', route: '/cart' },
  { icon: 'gift', label: 'Voucher', route: '/voucher' },
  { icon: 'heart', label: 'Wishlist', route: '/wishlist' },
];

const menuItems = [
  { icon: 'map-marker', label: 'My Address', popupContent: { title: 'My Address', content: '123 Main St, Springfield, IL 62701' } },
  { icon: 'th-large', label: 'All Categories', route: '/categories' },
  { icon: 'file-text', label: 'Terms and Conditions', popupContent: { 
    title: 'Terms and Conditions', 
    content: (
      <View>
        <Text>- By using our site, you agree to our terms and conditions.</Text>
        <Text>- Payments must be made within 30 days of order confirmation.</Text>
        <Text>- Refunds are only applicable within 14 days of purchase.</Text>
        <Text>- All sales are final on clearance items.</Text>
        <Text>- We reserve the right to modify these terms at any time.</Text>
      </View>
    )
  }},
  { icon: 'shield', label: 'Privacy Policy', popupContent: { 
    title: 'Privacy Policy', 
    content: (
      <View>
        <Text>- We value your privacy and never share your personal data.</Text>
        <Text>- All transactions are encrypted and securely processed.</Text>
        <Text>- You can request data deletion at any time by contacting support.</Text>
        <Text>- We collect information to improve your shopping experience.</Text>
      </View>
    )
  }},
  { icon: 'question-circle', label: 'FAQ', popupContent: { 
    title: 'Frequently Asked Questions', 
    content: (
      <View>
        <Text><strong>Q: How do I place an order?</strong></Text>
        <Text>A: Select your product, click "Add to Cart", then proceed to checkout.</Text>

        <Text><strong>Q: How can I track my order?</strong></Text>
        <Text>A: You can track your order from the "Orders" section in your profile.</Text>

        <Text><strong>Q: Do you offer international shipping?</strong></Text>
        <Text>A: Yes, we offer international shipping to select countries.</Text>

        <Text><strong>Q: Can I return items?</strong></Text>
        <Text>A: Returns are accepted within 14 days of purchase for eligible items.</Text>
      </View>
    )
  }},
  { icon: 'info-circle', label: 'About Us', popupContent: { 
    title: 'About Us', 
    content: (
      <View>
        <Text>We are Fashion Street, offering sustainable thrifted clothing and trendy fashion products.</Text>
        <Text>Our mission is to provide affordable, stylish, and eco-friendly options to fashion lovers.</Text>
        <Text>Fashion Street is committed to sustainability and reducing fashion waste through carefully curated collections.</Text>
      </View>
    )
  }},
  { icon: 'phone', label: 'Contact Us', popupContent: { 
    title: 'Contact Us', 
    content: (
      <View>
        <Text>- Email: support@fashionstreet.com</Text>
        <Text>- Phone: 1-800-123-4567</Text>
        <Text>- Live Chat: Available 24/7 on our website.</Text>
      </View>
    )
  }},
  { icon: 'info', label: 'App Info', popupContent: { 
    title: 'App Info', 
    content: 'Version: 1.0.0. Last updated on March 22, 2025.'
  }},
];

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: 'red',
    alignItems: 'center',
    padding: 20,
    marginBottom: 50,
    marginHorizontal: 10,
    paddingTop: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'white',
  },
  userName: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 10,
  },
  profileIcon: {
    position: 'absolute',
    right: 20,
    top: 30,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'red',
    paddingVertical: 15,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  menu: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  addressContainer: {
    width: '100%',
  },
  addressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
  },
  addressActions: {
    flexDirection: 'row',
  },
  addButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#DD2222',
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  addressForm: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DD2222',
    padding: 10,
    width: '100%',
    marginBottom: 20,
    borderRadius: 5,
  },
});

export default ProfileScreen;
