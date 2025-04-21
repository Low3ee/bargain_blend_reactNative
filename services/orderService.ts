export interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  orderItems: any;
  // New fields added:
  mopId?: number;
  addressId?: number;
  // Optionally include nested payment and address data if returned by the backend:
  mop?: {
    id: number;
    name: string;
    description?: string;
  };
  address?: {
    id: number;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

/**
 * Base URL for the backend API.
 */
const BASE_URL = "https://07b5bd714b71.ngrok.app/api";

/**
 * Fetches orders from the backend.
 * @param token - The authentication token.
 * @returns A Promise that resolves with an array of Order objects.
 */
export async function fetchOrders(token: string): Promise<Order[]> {
  const response = await fetch(`${BASE_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) { 
    throw new Error('Failed to fetch orders');
  }
  const data = await response.json();
  console.log(data);
  return data.orders;
}

/**
 * Fetches a single order by its ID.
 * @param token - The authentication token.
 * @param orderId - The ID of the order to fetch.
 * @returns A Promise that resolves with an Order object.
 */
export async function fetchOrderById(token: string, orderId: number): Promise<Order> {
  const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch the order');
  }
  const data = await response.json();
  return data.order;
}

/**
 * Creates a new order with order items.
 * @param token - The authentication token.
 * @param userId - The ID of the user placing the order.
 * @param total - The total amount for the order.
 * @param mopId - The mode of payment ID (1 for COD, 2 for Gcash, 3 for PayPal).
 * @param addressId - The ID of the selected address.
 * @param orderItems - An array of order items ({ productId, quantity, price }).
 * @returns A Promise that resolves with the created Order object.
 */
export async function createOrder(
  token: string,
  userId: string,
  total: number,
  mopId: number,
  addressId: number,
  orderItems: { productId: number; quantity: number; price: number }[]
): Promise<Order> {
  const response = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    // Include new fields mopId and addressId in the payload
    body: JSON.stringify({ userId, total, mopId, addressId, orderItems }),
  });
  if (!response.ok) {
    throw new Error('Failed to create order');
  }
  const data = await response.json();
  return data.order;
}

/**
 * Updates the status of an existing order.
 * @param token - The authentication token.
 * @param orderId - The ID of the order to update.
 * @param status - The new status (e.g., "pending", "processing", "completed", "cancelled").
 * @returns A Promise that resolves with the updated Order object.
 */
export async function updateOrderStatus(
  token: string,
  orderId: number,
  status: string
): Promise<Order> {
  const response = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error('Failed to update order status');
  }
  const data = await response.json();
  return data.order;
}
