import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the AuthResponse interface
interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    fname: string;
    lname: string;
    username: string;
  };
}

const BASE_URL = "http://localhost:3000/api";

// Check if it's a web environment or React Native
const isWeb = Platform.OS === 'web';

// Function to set token in the appropriate storage
const setAuthToken = (token: string) => {
  if (isWeb) {
    // Use localStorage on web
    localStorage.setItem('authToken', token);
  } else {
    // Use AsyncStorage in React Native
    AsyncStorage.setItem('authToken', token);
  }
};

// Function to get the token from the appropriate storage
export const getAuthToken = async (): Promise<string | null> => {
  if (isWeb) {
    // Use localStorage on web
    return localStorage.getItem('authToken');
  } else {
    // Use AsyncStorage in React Native
    return AsyncStorage.getItem('authToken');
  }
};

// Function to remove the token from the appropriate storage
export const removeAuthToken = async () => {
  if (isWeb) {
    // Use localStorage on web
    localStorage.removeItem('authToken');
  } else {
    // Use AsyncStorage in React Native
    await AsyncStorage.removeItem('authToken');
  }
};

// Function to authenticate user (Login or Register)
export async function authenticateUser(
  endpoint: "login" | "register",
  email: string,
  password: string,
  fname?: string,
  lname?: string,
  username?: string
): Promise<AuthResponse> {
  try {
    const body = { email, password, fname, lname, username };

    // Ensure the backend receives the correct structure
    const response = await fetch(`${BASE_URL}/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body), 
    });

    if (!response.ok) {
      const { message } = await response.json();
      return { success: false, message };
    }

    const { token, user } = await response.json();
    console.log(token, user);

    // Store the token in the appropriate storage
    setAuthToken(token);

    return { success: true, message: "Authentication successful", token, user };
  } catch (error) {
    console.error("Error during authentication:", error);
    return { success: false, message: "Authentication failed. Please try again later." };
  }
}

// Register User and auto-login
export async function registerUser(
  email: string,
  password: string,
  lname: string,
  fname: string,
  username: string
): Promise<AuthResponse> {
  // First, register the user
  const registerResponse = await authenticateUser("register", email, password, fname, lname, username);

  if (registerResponse.success) {
    // If registration is successful, auto-login the user
    const loginResponse = await loginUser(email, password);
    return loginResponse;
  } else {
    // If registration fails, return the registration error message
    return registerResponse;
  }
}

// Login User
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  return authenticateUser("login", email, password);
}
