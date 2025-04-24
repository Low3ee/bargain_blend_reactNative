import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Helper to determine if platform is web
const isWeb = Platform.OS === 'web';

// Async wrapper for web localStorage getItem
const webGetItem = async (key: string): Promise<string | null> => {
  try {
    console.log("checking", localStorage.getItem(key));
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting "${key}" from localStorage:`, error);
    return null;
  }
};

// Async wrapper for web localStorage setItem
const webSetItem = async (key: string, value: string): Promise<void> => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting "${key}" in localStorage:`, error);
  }
};

// Async wrapper for web localStorage removeItem
const webRemoveItem = async (key: string): Promise<void> => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing "${key}" from localStorage:`, error);
  }
};

// Unified method to get item from storage
export const getItem = async (key: string): Promise<string | null> => {
  try {
    return isWeb ? await webGetItem(key) : await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting "${key}" from storage:`, error);
    return null;
  }
};

// Unified method to set item in storage
export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    isWeb ? await webSetItem(key, value) : await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting "${key}" in storage:`, error);
  }
};

// Unified method to remove item from storage
export const removeItem = async (key: string): Promise<void> => {
  try {
    isWeb ? await webRemoveItem(key) : await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing "${key}" from storage:`, error);
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

// Get the full user_info object
export const getProfileDetails = async () => {
  const data = await getItem('user_info');
  return parseJSON(data);
};

// Get a specific field from user_info
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

// Alias for getProfileDetails (for compatibility)
export const getDetails = getProfileDetails;

export const clearAllStorage = async (): Promise<void> => {
  try {
    if (isWeb) {
      localStorage.clear();
      console.log('Web storage cleared');
    } else {
      await AsyncStorage.clear();
      console.log('AsyncStorage cleared');
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};