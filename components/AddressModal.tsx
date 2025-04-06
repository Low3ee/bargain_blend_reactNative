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
import AddressService from '@/app/services/addressService';

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
  const [isAdding, setIsAdding] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateField, setStateField] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const userId = 1; // TODO: replace with actual authenticated user ID

  useEffect(() => {
    if (modalVisible) loadAddresses();
  }, [modalVisible]);

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
    } catch (error) {
      console.error('Failed to load addresses', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStreet(''); setCity(''); setStateField(''); setZip(''); setCountry(''); setEditId(null);
  };

  const startAdd = () => { resetForm(); setIsAdding(true); };
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
          userId, street, city, state: stateField, zip, country,
          status: 'RESERVE', primary: false,
        });
        setAddresses(prev => prev.map(a =>
          a.id === editId
            ? { id: updated.id.toString(), address: `${updated.street}, ${updated.city}, ${updated.state}, ${updated.zip}, ${updated.country}`, raw: updated }
            : a
        ));
      } else {
        const created = await AddressService.createAddress({
          userId, street, city, state: stateField, zip, country,
          status: 'active', primary: addresses.length === 0,
        });
        setAddresses(prev => [
          ...prev,
          { id: created.id.toString(), address: `${created.street}, ${created.city}, ${created.state}, ${created.zip}, ${created.country}`, raw: created },
        ]);
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
    } catch (error) {
      console.error('Error deleting address', error);
    }
  };

  const handleSelect = async (item: Address) => {
    try {
      // Mark this address as primary on server
      await AddressService.updateAddress(item.raw.id, {
        ...item.raw,
        userId,
        status: item.raw.status || 'PRIMARY',
        primary: true,
      });
      onSelectAddress(item.raw);
      setModalVisible(false);
      loadAddresses(); // refresh to show updated primaries
    } catch (error) {
      console.error('Error setting primary address', error);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
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
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.addressItem}>
                        <TouchableOpacity style={{ flex:1 }} onPress={() => handleSelect(item)}>
                          <Text style={[
                            styles.addressText,
                            item.raw.primary && styles.primaryAddress
                          ]}>
                            {item.address} {item.raw.primary ? '(Primary)' : ''}
                          </Text>
                        </TouchableOpacity>
                        <View style={styles.addressActions}>
                          <TouchableOpacity onPress={() => startEdit(item.id)}>
                            <FontAwesome name="edit" size={20} color="#DD2222" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDelete(item.id)}>
                            <FontAwesome name="trash" size={20} color="#DD2222" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={startAdd}>
                    <Text style={styles.addButtonText}>+ Add New Address</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.addressForm}>
                  <TextInput style={styles.input} placeholder="Street" value={street} onChangeText={setStreet} />
                  <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
                  <TextInput style={styles.input} placeholder="State" value={stateField} onChangeText={setStateField} />
                  <TextInput style={styles.input} placeholder="ZIP" value={zip} onChangeText={setZip} keyboardType="numeric" />
                  <TextInput style={styles.input} placeholder="Country" value={country} onChangeText={setCountry} />
                  <Button title={editId ? 'Update Address' : 'Save Address'} onPress={handleSave} color="#DD2222" />
                </View>
              )}
            </View>
          )}
          <Button title="Close" onPress={() => { setModalVisible(false); setIsAdding(false); resetForm(); }} color="#DD2222" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor:'white', padding:20, borderRadius:10, width:'90%', maxHeight:'90%' },
  modalTitle: { fontSize:20, fontWeight:'bold', marginBottom:10, textAlign:'center' },
  addressContainer: { width:'100%' },
  addressItem: { flexDirection:'row', justifyContent:'space-between', paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#ddd' },
  addressText: { fontSize:14, color:'#333', flex:1, marginRight:10 },
  primaryAddress: { fontWeight:'bold', color:'#007700' },
  addressActions: { flexDirection:'row', alignItems:'center' },
  addButton: { marginTop:15, padding:10, backgroundColor:'#DD2222', borderRadius:5, alignItems:'center' },
  addButtonText: { color:'white', fontSize:16 },
  addressForm: { width:'100%' },
  input: { borderWidth:1, borderColor:'#DD2222', padding:10, width:'100%', marginBottom:15, borderRadius:5 },
});

export default AddressModal;
