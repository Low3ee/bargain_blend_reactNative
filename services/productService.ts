// src/app/models/product.model.ts
export interface Variant {
  id: string;
  size?: string;
  color?: string;
  condition?: string;
  price?: number;
  stock?: number;
}

export interface Product {
  id: string;
  name: string;
  rating: number;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  image: string;
  images?: Array<{
    url: string;
    altText?: string;
    order: number;
  }>;
  variants: Variant[];
}
import { API } from "@/services/config";

const BASE_URL = `${API}`;
const IMAGE_BASE_URL = `${API}/uploads`;
const BYPASS_TUNNEL_HEADER = "ngrok-skip-browser-warning";
const HEADER_VALUE = "your-custom-value";

// Ensure product.image is set to first ordered image or placeholder
function updateProductImage(product: Product): Product {
  const imageUrl =
    product.images && product.images.length
      ? product.images.sort((a, b) => a.order - b.order)[0].url
      : `${IMAGE_BASE_URL}/placeholder.png`;
  return { ...product, image: imageUrl };
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  options.headers = {
    ...(options.headers || {}),
    [BYPASS_TUNNEL_HEADER]: HEADER_VALUE,
    ...((options.method && options.method !== 'GET') ? {'Content-Type': 'application/json'} : {}),
  };
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getProducts(): Promise<Product[]> {
  const products = await fetchJson<Product[]>(`${BASE_URL}/products`);
  return products.map(updateProductImage);
}

export async function getProduct(id: string): Promise<Product> {
  const product = await fetchJson<Product>(`${BASE_URL}/products/${id}`);
  return updateProductImage(product);
}

export async function getProductStock(id: string): Promise<number> {
  try {
    const { stock } = await fetchJson<{ stock: number }>(`${BASE_URL}/products/stock/${id}`);
    console.log("Stock:", stock);
    return stock;
  } catch {
    return 0;
  }
}

export async function getProductsByCategory(id: string): Promise<Product[]> {
  const products = await fetchJson<Product[]>(`${BASE_URL}/products/category/${id}`);
  return products.map(updateProductImage);
}

export async function createProduct(
  newProduct: Omit<Product, 'id' | 'image' | 'images'>
): Promise<Product> {
  const product = await fetchJson<Product>(`${BASE_URL}/products`, {
    method: 'POST',
    body: JSON.stringify(newProduct),
  });
  return updateProductImage(product);
}

export async function updateProduct(
  id: string,
  updatedProduct: Omit<Product, 'id' | 'image' | 'images'>
): Promise<Product> {
  const product = await fetchJson<Product>(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedProduct),
  });
  return updateProductImage(product);
}

export async function deleteProduct(id: string): Promise<void> {
  await fetchJson<void>(`${BASE_URL}/products/${id}`, { method: 'DELETE' });
}
