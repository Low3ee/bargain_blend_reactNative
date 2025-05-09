import { CartItem } from '@/utils/cartStorage';
import { getUserInfoField } from '@/utils/profileUtil';
import { API } from "@/services/config";

const API_URL = `${API}/cart`;

export const syncCartWithBackend = async (cartItems: CartItem[]): Promise<void> => {
  const userId = await getUserInfoField('id');
  if (!cartItems.length) return;
  const res = await fetch(`${API_URL}/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cartItems, userId: parseInt(userId) }) });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to sync');
  }
};

export const checkoutCart = async (cartItems: CartItem[]): Promise<void> => {
  if (!cartItems.length) return;
  const res = await fetch(`${API_URL}/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cartItems }) });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Checkout failed');
  }
};