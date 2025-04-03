import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the CartItem type
export interface CartItem {
  id: number;
  name: string;
  price: number;  // price as number for easier arithmetic
  image: string;
  quantity: number;
}

// Key for storing cart items in AsyncStorage
const CART_KEY = 'cartItems';

// Function to get cart items from AsyncStorage
export const getCartItems = async (): Promise<CartItem[]> => {
  try {
    const cartData = await AsyncStorage.getItem(CART_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error fetching cart items from AsyncStorage', error);
    return [];
  }
};

// Function to save cart items to AsyncStorage
export const saveCart = async (cartItems: CartItem[]): Promise<void> => {
  try {
    const cartData = JSON.stringify(cartItems);
    await AsyncStorage.setItem(CART_KEY, cartData);
  } catch (error) {
    console.error('Error saving cart items to AsyncStorage', error);
  }
};

// Function to add an item to the cart (only update AsyncStorage)
export const addToCartLocal = async (newItem: CartItem): Promise<void> => {
  try {
    const existingCartItems = await getCartItems();
    const itemIndex = existingCartItems.findIndex((item) => item.id === newItem.id);

    if (itemIndex > -1) {
      // If the item already exists, update the quantity
      existingCartItems[itemIndex].quantity += newItem.quantity;
    } else {
      // If the item doesn't exist in the cart, add it
      existingCartItems.push(newItem);
    }

    // Save the updated cart items to AsyncStorage
    await saveCart(existingCartItems);
    console.log('Item added to cart locally');
  } catch (error) {
    console.error('Error adding item to cart', error);
  }
};

// Function to remove an item from the cart (only update AsyncStorage)
export const removeCartItemLocal = async (itemId: number): Promise<void> => {
  try {
    const existingCartItems = await getCartItems();
    const updatedCartItems = existingCartItems.filter(item => item.id !== itemId);

    // Save the updated cart items to AsyncStorage
    await saveCart(updatedCartItems);
    console.log('Cart item removed locally');
  } catch (error) {
    console.error('Error removing item from cart', error);
  }
};

// Function to update the quantity of an item in the cart (only update AsyncStorage)
export const updateCartItemQuantityLocal = async (itemId: number, quantity: number): Promise<void> => {
  try {
    const existingCartItems = await getCartItems();
    const itemIndex = existingCartItems.findIndex((item) => item.id === itemId);

    if (itemIndex > -1) {
      existingCartItems[itemIndex].quantity = quantity;
    }

    // Save the updated cart items to AsyncStorage
    await saveCart(existingCartItems);
    console.log('Cart item quantity updated locally');
  } catch (error) {
    console.error('Error updating item quantity in cart', error);
  }
};

// Function to clear the cart (only update AsyncStorage)
export const clearCartLocal = async (): Promise<void> => {
  try {
    // Remove cart items from AsyncStorage
    await AsyncStorage.removeItem(CART_KEY);
    console.log('Cart cleared locally');
  } catch (error) {
    console.error('Error clearing cart', error);
  }
};

// Function to calculate the total amount of the cart
export const calculateTotalAmountLocal = async (): Promise<number> => {
  try {
    const cartItems = await getCartItems();
    // Calculate total amount by summing price * quantity
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  } catch (error) {
    console.error('Error calculating total amount', error);
    return 0;
  }
};

// Function to checkout the cart (clear cart after checkout)
export const checkoutCartLocal = async (): Promise<boolean> => {
  try {
    const cartItems = await getCartItems();

    if (cartItems.length === 0) {
      console.error("Cart is empty, cannot checkout locally.");
      return false; // Return false if cart is empty
    }

    // Perform any necessary local actions for checkout
    // Example: Clear the cart from AsyncStorage after checkout
    await clearCartLocal();

    // Optionally, you can save the checkout data to your database or API at this point

    console.log("Local checkout successful, cart cleared.");
    return true; // Return true if checkout was successful
  } catch (error) {
    console.error('Error during local checkout', error);
    return false;
  }
};
