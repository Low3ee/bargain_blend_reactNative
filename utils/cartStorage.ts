import { getItem, setItem, removeItem } from './profileUtil';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const CART_KEY = 'cartItems';

export const getCartItems = async (): Promise<CartItem[]> => {
  const data = await getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCart = async (items: CartItem[]) => {
  await setItem(CART_KEY, JSON.stringify(items));
};

export const addToCartLocal = async (newItem: CartItem): Promise<boolean> => {
  try {
    const items = await getCartItems();
    const idx = items.findIndex(i => i.id === newItem.id);
    if (idx > -1) {
      items[idx].quantity += newItem.quantity;
    } else {
      items.push(newItem);
    }
    await saveCart(items);
    return true;
  } catch (error) {
    console.error('Error adding to cart', error);
    return false;
  }
};

export const updateCartItemQuantityLocal = async (id: number, quantity: number) => {
  const items = await getCartItems();
  const idx = items.findIndex(i => i.id === id);
  if (idx > -1) {
    items[idx].quantity = quantity;
    await saveCart(items);
  }
};

export const removeCartItemLocal = async (id: number) => {
  const items = await getCartItems();
  const filtered = items.filter(i => i.id !== id);
  await saveCart(filtered);
};

export const clearCartLocal = async () => {
  await removeItem(CART_KEY);
};

export const calculateTotalAmountLocal = async (): Promise<number> => {
  const items = await getCartItems();
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};
