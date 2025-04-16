import React, { useEffect, useState } from 'react';
import {
  View,
  Modal,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AddressService from '@/app/services/addressService';
import {
  FIXED_COUNTRY,
  PHILIPPINE_CITIES,
  PHILIPPINE_PROVINCES,
  formatAddress,
} from '@/app/utils/addressUtil';

export interface Address {
  id: string;
  address: string;
  raw: {
    id: number;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    status?: "PRIMARY" | "RESERVE";
    primary?: boolean;
  };
}

interface AddressModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  onSelectAddress: (address: Address['raw']) => void;
}

const AddressModal: React.FC<AddressModalProps> = ({
  modalVisible,
  setModalVisible,
  onSelectAddress,
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateField, setStateField] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState(FIXED_COUNTRY);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const userId = 1; // TODO: replace with actual authenticated user ID

  useEffect(() => {
    if (modalVisible) loadAddresses();
  }, [modalVisible]);

  // Load addresses and auto-select primary if available.
  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await AddressService.getAddressesByUserId(userId);
      const formatted: Address[] = data.map((a: any) => ({
        id: a.id.toString(),
        address: `${a.street}, ${a.city}, ${a.state}, ${a.zip}, ${a.country}`,
        raw: a,
      }));
      setAddresses(formatted);
      // Auto-select primary address if exists.
      const primary = formatted.find(
        (addr) => addr.raw.primary === true || addr.raw.status === 'PRIMARY'
      );
      if (primary) {
        setSelectedAddressId(primary.id);
      }
    } catch (error) {
      console.error('Failed to load addresses', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStreet('');
    setCity('');
    setStateField('');
    setZip('');
    setCountry(FIXED_COUNTRY);
    setEditId(null);
  };

  const startAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const startEdit = (id: string) => {
    const a = addresses.find(addr => addr.id === id);
    if (!a) return;
    setEditId(id);
    setStreet(a.raw.street);
    setCity(a.raw.city);
    setStateField(a.raw.state);
    setZip(a.raw.zip);
    setCountry(a.raw.country);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!street.trim()) return;
    try {
      if (editId) {
        const updated = await AddressService.updateAddress(Number(editId), {
          userId,
          street,
          city,
          state: stateField,
          zip,
          country: FIXED_COUNTRY, // ensure the country remains fixed
          status: 'RESERVE',
          primary: false,
        });
        setAddresses(prev =>
          prev.map(a =>
            a.id === editId
              ? {
                  id: updated.id.toString(),
                  address: formatAddress({
                    street: updated.street,
                    city: updated.city,
                    province: updated.state,
                    zip: updated.zip,
                  }),
                  raw: updated,
                }
              : a
          )
        );
      } else {
        // Mark as primary if it's the first address.
        const isFirstAddress = addresses.length === 0;
        const created = await AddressService.createAddress({
          street,
          city,
          state: stateField,
          zip,
          country: FIXED_COUNTRY,
          status: 'PRIMARY',
          primary: isFirstAddress,
        });
        setAddresses(prev => [
          ...prev,
          {
            id: created.id.toString(),
            address: formatAddress({
              street: created.street,
              city: created.city,
              province: created.state,
              zip: created.zip,
            }),
            raw: created,
          },
        ]);
        // Auto-select the newly created address if it's the first one.
        if (isFirstAddress) {
          setSelectedAddressId(created.id.toString());
        }
      }
      resetForm();
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving address', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await AddressService.deleteAddress(Number(id));
      setAddresses(prev => prev.filter(a => a.id !== id));
      // If the deleted address was selected, clear selection.
      if (selectedAddressId === id) {
        setSelectedAddressId(null);
      }
    } catch (error) {
      console.error('Error deleting address', error);
    }
  };

  // Instead of immediately selecting an address on tap,
  // we now update the selectedAddressId.
  const handleSelect = (item: Address) => {
    setSelectedAddressId(item.id);
  };

  // Confirm button in the modal calls handleConfirm.
  const handleConfirm = async () => {
    if (!selectedAddressId) return;
    try {
      const selected = addresses.find(addr => addr.id === selectedAddressId);
      if (!selected) return;
      // Optionally update the address on server to mark it primary.
      await AddressService.updateAddress(selected.raw.id, {
        ...selected.raw,
        userId,
        status: selected.raw.status || 'PRIMARY',
        primary: true,
      });
      onSelectAddress(selected.raw);
      setModalVisible(false);
      loadAddresses(); // refresh to show updated primary address.
    } catch (error) {
      console.error('Error setting primary address', error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select or Add Address</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#DD2222" />
          ) : (
            <View style={styles.addressContainer}>
              {!isAdding ? (
                <>
                  <FlatList
                    data={addresses}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.addressItem,
                          selectedAddressId === item.id && styles.selectedAddressItem,
                        ]}
                        onPress={() => handleSelect(item)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.addressText, item.raw.primary && styles.primaryAddress]}>
                            {item.address} {item.raw.primary ? '(Primary)' : ''}
                          </Text>
                        </View>
                        <View style={styles.addressActions}>
                          <TouchableOpacity onPress={() => startEdit(item.id)} style={styles.actionButton}>
                            <FontAwesome name="edit" size={20} color="#DD2222" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
                            <FontAwesome name="trash" size={20} color="#DD2222" />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={startAdd}>
                    <Text style={styles.addButtonText}>+ Add New Address</Text>
                  </TouchableOpacity>
                  {/* Confirm Selected Address Button */}
                  {selectedAddressId && (
                    <TouchableOpacity style={[styles.confirmButton, { marginTop: 15 }]} onPress={handleConfirm}>
                      <Text style={styles.confirmButtonText}>Confirm Address</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <View style={styles.addressForm}>
                  <TextInput
                    style={styles.input}
                    placeholder="Street"
                    value={street}
                    onChangeText={setStreet}
                  />
                  <Text style={styles.label}>City</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={city}
                      onValueChange={(itemValue) => setCity(itemValue)}
                    >
                      <Picker.Item label="Select City" value="" />
                      {PHILIPPINE_CITIES.map((cityOption) => (
                        <Picker.Item key={cityOption} label={cityOption} value={cityOption} />
                      ))}
                    </Picker>
                  </View>
                  <Text style={styles.label}>Province</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={stateField}
                      onValueChange={(itemValue) => setStateField(itemValue)}
                    >
                      <Picker.Item label="Select Province" value="" />
                      {PHILIPPINE_PROVINCES.map((provinceOption) => (
                        <Picker.Item key={provinceOption} label={provinceOption} value={provinceOption} />
                      ))}
                    </Picker>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="ZIP"
                    value={zip}
                    onChangeText={setZip}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Country"
                    value={FIXED_COUNTRY}
                    editable={false} // fixed country; disable editing
                  />
                  <View style={styles.formButtons}>
                    <Button
                      title={editId ? 'Update Address' : 'Save Address'}
                      onPress={handleSave}
                      color="#DD2222"
                    />
                    <View style={{ width: 10 }} />
                    <Button
                      title="Cancel"
                      onPress={() => {
                        setIsAdding(false);
                        resetForm();
                      }}
                      color="#DD2222"
                    />
                  </View>
                </View>
              )}
            </View>
          )}
          <View style={styles.modalFooter}>
            <Button
              title="Close"
              onPress={() => {
                setModalVisible(false);
                setIsAdding(false);
                resetForm();
              }}
              color="#DD2222"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  addressContainer: {
    width: '100%',
  },
  addressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  selectedAddressItem: {
    borderColor: '#DD2222',
    backgroundColor: '#fff',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  primaryAddress: {
    fontWeight: 'bold',
    color: '#007700',
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginHorizontal: 5,
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
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DD2222',
    borderRadius: 5,
    marginBottom: 15,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: '#DD2222',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalFooter: {
    marginTop: 20,
  },
});

export default AddressModal;
