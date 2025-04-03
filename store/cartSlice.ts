import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state of the cart
interface CartState {
  cartItems: any[]; // You can define this with more specific types
}

const initialState: CartState = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Action to set the cart items
    setCartItems(state: { cartItems: any; }, action: PayloadAction<any[]>) {
      state.cartItems = action.payload;
    },
    // Action to add an item to the cart
    addCartItem(state: { cartItems: any[]; }, action: PayloadAction<any>) {
      state.cartItems.push(action.payload);
    },
    // Action to remove an item from the cart
    removeCartItem(state: { cartItems: any[]; }, action: PayloadAction<any>) {
      state.cartItems = state.cartItems.filter((item: { id: any; }) => item.id !== action.payload.id);
    },
  },
});

// Export actions
export const { setCartItems, addCartItem, removeCartItem } = cartSlice.actions;

// Export the reducer to be added to the store
export default cartSlice.reducer;
