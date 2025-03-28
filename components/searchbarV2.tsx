// SearchBar.tsx
import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Modal, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<Props> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  // Handle search input
  const handleSearch = () => {
    onSearch(searchQuery);
  };

  return (
    <View style={styles.container}>
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

      {/* Filter Button to Show Popup */}
      <TouchableOpacity onPress={() => setFilterVisible(true)} style={styles.filterButton}>
        <MaterialCommunityIcons name="filter" size={24} color="#000" />
      </TouchableOpacity>

      {/* Filter Popup Modal */}
      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filters</Text>

            {/* Price Filter Options */}
            <TouchableOpacity
              onPress={() => {
                setFilterVisible(false);
                // Assume you have a prop or callback function for applying price filters
                onSearch('low'); // This would be the actual logic for filtering low to high
              }}
              style={styles.filterOption}
            >
              <Text>Price: Low to High</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setFilterVisible(false);
                onSearch('high'); // This would be the actual logic for filtering high to low
              }}
              style={styles.filterOption}
            >
              <Text>Price: High to Low</Text>
            </TouchableOpacity>

            {/* Close the modal */}
            <TouchableOpacity onPress={() => setFilterVisible(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
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
  filterButton: {
    marginLeft: 10,
    padding: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterOption: {
    paddingVertical: 10,
  },
  modalCloseButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#ff6666',
  },
});

export default SearchBar;
