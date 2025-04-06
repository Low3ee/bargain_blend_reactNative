export interface Order {
    id: number;
    total: number;
    status: string;
    createdAt: string;
    // Add any additional fields as needed, e.g., orderItems, etc.
  }
  
  /**
   * Base URL for the backend API.
   */
  const BASE_URL = "http://localhost:3000/api";
  
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
   * @param total - The total amount for the order.
   * @param orderItems - An array of order items ({ productId, quantity, price }).
   * @returns A Promise that resolves with the created Order object.
   */
  export async function createOrder(
    token: string,
    userId: string,
    total: number,
    orderItems: { productId: number; quantity: number; price: number }[]
  ): Promise<Order> {
    const response = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({userId, total, orderItems }),
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
  