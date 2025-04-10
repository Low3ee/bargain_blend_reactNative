//@ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Button,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import AddressModal from '@/components/AddressModal';
import { getProfileDetails, getName } from '../utils/profileUtil';
import { removeAuthToken } from '../services/authService';

const router = useRouter();
const quickActions = [
  { icon: 'shopping-bag', label: 'Orders', route: '/orders', type: 'link' },
  { icon: 'shopping-cart', label: 'Cart', route: '/cart', type: 'link' },
  { icon: 'gift', label: 'Voucher', route: '/voucher', type: 'link' },
  { icon: 'heart', label: 'Wishlist', route: '/wishlist', type: 'link' },
];

const menuItems = [
  { icon: 'map-marker', label: 'My Address', type: 'address' },
  {
    icon: 'file-text',
    label: 'Terms and Conditions',
    type: 'terms',
    popupContent: {
      title: 'Terms and Conditions',
      content: (
        <View>
          <Text>- By using our site, you agree to our terms and conditions.</Text>
          <Text>- Payments must be made within 30 days of order confirmation.</Text>
          <Text>- Refunds are only applicable within 14 days of purchase.</Text>
          <Text>- All sales are final on clearance items.</Text>
          <Text>- We reserve the right to modify these terms at any time.</Text>
        </View>
      ),
    },
  },
  {
    icon: 'shield',
    label: 'Privacy Policy',
    type: 'privacy',
    popupContent: {
      title: 'Privacy Policy',
      content: (
        <View>
          <Text>- We value your privacy and never share your personal data.</Text>
          <Text>- All transactions are encrypted and securely processed.</Text>
          <Text>- You can request data deletion at any time by contacting support.</Text>
          <Text>- We collect information to improve your shopping experience.</Text>
        </View>
      ),
    },
  },
  {
    icon: 'question-circle',
    label: 'FAQ',
    type: 'faq',
    popupContent: {
      title: 'Frequently Asked Questions',
      content: (
        <View>
          <Text><Text style={{ fontWeight: 'bold' }}>Q: How do I place an order?</Text></Text>
          <Text>A: Select your product, click "Add to Cart", then proceed to checkout.</Text>

          <Text><Text style={{ fontWeight: 'bold' }}>Q: How can I track my order?</Text></Text>
          <Text>A: You can track your order from the "Orders" section in your profile.</Text>

          <Text><Text style={{ fontWeight: 'bold' }}>Q: Do you offer international shipping?</Text></Text>
          <Text>A: Yes, we offer international shipping to select countries.</Text>

          <Text><Text style={{ fontWeight: 'bold' }}>Q: Can I return items?</Text></Text>
          <Text>A: Returns are accepted within 14 days of purchase for eligible items.</Text>
        </View>
      ),
    },
  },
  {
    icon: 'info-circle',
    label: 'About Us',
    type: 'about',
    popupContent: {
      title: 'About Us',
      content: (
        <View>
          <Text>We are Fashion Street, offering sustainable thrifted clothing and trendy fashion products.</Text>
          <Text>Our mission is to provide affordable, stylish, and eco-friendly options to fashion lovers.</Text>
          <Text>Fashion Street is committed to sustainability and reducing fashion waste through carefully curated collections.</Text>
        </View>
      ),
    },
  },
  {
    icon: 'phone',
    label: 'Contact Us',
    type: 'contact',
    popupContent: {
      title: 'Contact Us',
      content: (
        <View>
          <Text>- Email: support@fashionstreet.com</Text>
          <Text>- Phone: 1-800-123-4567</Text>
        </View>
      ),
    },
  },
  {
    icon: 'info',
    label: 'App Info',
    type: 'info',
    popupContent: {
      title: 'App Info',
      content: 'Version: 1.0.0. Last updated on March 22, 2025.',
    },
  },
];

const ProfileScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContentType, setModalContentType] = useState<string | null>(null);
  const [userName, setUserName] = useState<String>('John Doe');

  const openModal = (type: string) => {
    setModalContentType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalContentType(null);
  };

  const currentItem = menuItems.find(i => i.type === modalContentType);
  useEffect(() => {
    const setProfileDeets = async () => {
      const name = await getName();
  
      if (!name) {
        router.replace('/authScreen');
        return;
      }
      setUserName(name);
    };
  
    setProfileDeets();
  }, []);
  const handleLogOut = async() =>{
    await removeAuthToken();
    router.replace('/authScreen');
  } 
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image source={{ uri: 'https://via.placeholder.com/80' }} style={styles.profileImage} />
        <Text style={styles.userName}>{userName}</Text>
        <FontAwesome name="user-circle" size={24} color="white" style={styles.profileIcon} />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={() => action.type === 'link' ? null : openModal(action.type)}
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
            onPress={() => item.route ? null : openModal(item.type)}
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
        <TouchableOpacity onPress={handleLogOut} style={styles.menuItem}>
          <Text style={styles.logOutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Address Modal or Generic Modal */}
      {modalContentType === 'address' ? (
        <AddressModal modalVisible={modalVisible} setModalVisible={closeModal} />
      ) : (
        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{currentItem?.popupContent?.title}</Text>
              <View style={styles.modalDescription}>
                {currentItem?.popupContent?.content}
              </View>
              <Button title="Close" onPress={closeModal} color="#DD2222" />
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

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
  logOutText: {
    color: 'red',
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
});

export default ProfileScreen;
