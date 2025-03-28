import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Modal, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Props {
  onSearch: (query: string) => void;
}

const Header: React.FC<Props> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const router = useRouter();

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  return (
    <View style={styles.headerContainer}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <MaterialCommunityIcons name="magnify" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Cart Icon */}
      <TouchableOpacity onPress={() => router.push('/cart')} style={styles.cartButton}>
        <MaterialCommunityIcons name="cart" size={30} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DD2222',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  searchButton: {
    padding: 5,
  },
  cartButton: {
    padding: 5,
  },
});

export default Header;
