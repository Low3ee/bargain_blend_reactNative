import { CartItem } from '@/app/utils/cartStorage';

const API_URL = 'http://localhost:3000/api/cart';

// Function to sync cart with backend (called on exit or logout)
export const syncCartWithBackend = async (cartItems: CartItem[]): Promise<void> => {
  try {
    if (cartItems.length === 0) return; // If the cart is empty, no need to sync

    const response = await fetch(`${API_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartItems }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to sync cart with server');
    }

    const data = await response.json();
    console.log('Cart synced successfully with server:', data);
  } catch (error) {
    console.error('Error syncing cart with server', error);
  }
};

// Function to perform checkout on the server
export const checkoutCart = async (cartItems: CartItem[], userId: string): Promise<void> => {
  try {
    if (cartItems.length === 0) return;

    const response = await fetch(`${API_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, cartItems }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Checkout failed');
    }

    const data = await response.json();
    console.log('Checkout successful:', data);
  } catch (error) {
    console.error('Error during checkout', error);
  }
};
export const checkout = (userId: any, paymentMethod: any) => {
    console.log(checkout);
    return 'success';
}
