import { getItem, setItem, removeItem } from './profileUtil';

export interface CartItem {
  id: any;
  productId: number;    // the parent product
  variantId: number;    // the exact variant chosen
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

const CART_KEY = 'cartItems';

export const getCartItems = async (): Promise<CartItem[]> => {
  const data = await getItem(CART_KEY);
  if (!data) return [];

  const parsed: any[] = JSON.parse(data);

  return parsed.map(item => ({
    ...item,
    variantId: Number(item.variantId || item.id),
    price: Number(item.price),
    quantity: Number(item.quantity),
  }));
};


export const saveCart = async (items: CartItem[]) => {
  await setItem(CART_KEY, JSON.stringify(items));
};

/**
 * Adds an item to cart.
 * If that exact variant is already present, just increments its quantity.
 */
export const addToCartLocal = async (newItem: CartItem): Promise<boolean> => {
  try {
    const items = await getCartItems();
    const idx = items.findIndex(i => i.variantId === newItem.variantId);

    if (idx > -1) {
      // variant already in cart → bump quantity
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

/**
 * Sets the quantity for a given variant.
 */
export const updateCartItemQuantityLocal = async (
  variantId: number,
  quantity: number
) => {
  const items = await getCartItems();
  const idx = items.findIndex(i => i.variantId === variantId);
  if (idx > -1) {
    items[idx].quantity = quantity;
    await saveCart(items);
  }
};

/**
 * Removes an entire variant from the cart.
 */
export const removeCartItemLocal = async (variantId: number) => {
  const items = await getCartItems();
  const filtered = items.filter(i => i.variantId !== variantId);
  await saveCart(filtered);
};

/** Wipes the whole cart */
export const clearCartLocal = async () => {
  await removeItem(CART_KEY);
};

/** Totals up price * quantity for all variants in the cart */
export const calculateTotalAmountLocal = async (): Promise<number> => {
  const items = await getCartItems();
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};
