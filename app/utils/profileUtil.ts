import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Helper to determine if platform is web
const isWeb = Platform.OS === 'web';

// Get storage method based on platform
export const getStorage = async () => {
  return isWeb ? localStorage : AsyncStorage;
};

// Unified method to get item from storage
const getItem = async (key: string): Promise<string | null> => {
  try {
    return isWeb ? localStorage.getItem(key) : await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting "${key}" from storage:`, error);
    return null;
  }
};

// Parse JSON safely
const parseJSON = (data: string | null) => {
  try {
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('JSON parsing error:', error);
    return null;
  }
};

// Get whole user_info object
export const getProfileDetails = async () => {
  const data = await getItem('user_info');
  return parseJSON(data);
};

// Get specific field from user_info
export const getUserInfoField = async (field: string): Promise<any> => {
  const userInfo = await getProfileDetails();
  return userInfo?.[field] ?? null;
};

// Get user's full name
export const getName = async (): Promise<string> => {
  const fname = await getUserInfoField('fname');
  const lname = await getUserInfoField('lname');
  return fname && lname ? `${fname} ${lname}` : '';
};

// Get auth token
export const getToken = async (): Promise<string | null> => {
  const token = await getItem('authToken');
  return token ?? null;
};

// Alias for getProfileDetails (to maintain compatibility if needed)
export const getDetails = getProfileDetails;
