import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const getProfileDetails = async () => {
    const device = Platform.OS;
  
    let userInfo: string | null = null;
  
    if (device === 'web') {
      userInfo = localStorage.getItem('user_info');
    }
  
    if (device === 'android' || device === 'ios') {
      userInfo = await AsyncStorage.getItem('user_info');
    }
  
    if (userInfo) {
      try {
        return JSON.parse(userInfo);  // Parse the string into an object
      } catch (error) {
        console.error("Failed to parse user info:", error);
        return null;
      }
    }
  
    return null;
  };
  

export const getStorage = async () => {
  const device = Platform.OS;

  if (device === 'web') {
    return localStorage;
  }

  return AsyncStorage;
};

export const getName = async () => {
    if (Platform.OS === 'web') {
      const info = localStorage.getItem('user_info');
      if (info) {
        const parsedInfo = JSON.parse(info); // Parse the string to an object
        return parsedInfo.fname + ' ' + parsedInfo.lname;
      }
    } else {
      try {
        const info = await AsyncStorage.getItem('user_info');
        if (info) {
          const parsedInfo = JSON.parse(info);
          return parsedInfo.fname + ' ' + parsedInfo.lname;
        }
      } catch (error) {
        console.error('Error getting user info from AsyncStorage:', error);
      }
    }
    return '';
  };
  

  export const getToken = async () => {
    if (Platform.OS === 'web') {
      const info = localStorage.getItem('authToken');
      if (info) {
        return info
      }
    } else {
      try {
        const info = await AsyncStorage.getItem('authToken');
        if (info) {
          
          return info
        }
      } catch (error) {
        console.error('Error getting user token from AsyncStorage:', error);
      }
    }
    return '';
  };


  export const getDetails= async () => {
    if (Platform.OS === 'web') {
      const info = localStorage.getItem('user_info');
      if (info) {
        const parsedInfo = JSON.parse(info); 
        return parsedInfo;
      }
    } else {
      try {
        const info = await AsyncStorage.getItem('user_info');
        if (info) {
          const parsedInfo = JSON.parse(info);
          return parsedInfo;
        }
      } catch (error) {
        console.error('Error getting user info from AsyncStorage:', error);
      }
    }
    return '';
  };