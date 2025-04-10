export interface Product {
  image: string;
  id: string;
  name: string;
  rating: number;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
}

const BASE_URL = "http://localhost:3000/api";
const IMAGE_URL = "http://localhost:3000/api/image"; // Base URL for images
const BYPASS_TUNNEL_HEADER = 'ngrok-skip-browser-warning';
const HEADER_VALUE = 'your-custom-value'; // Set your custom value here

// Helper function to update image URLs
function updateProductImage(product: Product): Product {
  return { 
    ...product, 
    image: `${IMAGE_URL}/${product.image || 'placeholder.png'}`
  };
}

// Get all products
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${BASE_URL}/products`, {
      headers: {
        'grok-skip-browser-warning': HEADER_VALUE,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const products: Product[] = await response.json();
    console.log(products);
    return products.map(updateProductImage);
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

// Get a single product by ID
export async function getProduct(id: string): Promise<Product> {
  try {
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      headers: {
        'bypass-tunnel-reminder': HEADER_VALUE,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    const product: Product = await response.json();
    console.log(product);
    return updateProductImage(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

export async function getProductStock(id: string): Promise<number> {
  try {
    const res = await fetch(`${BASE_URL}/products/stock/${id}`);
    if (!res.ok) throw new Error('Failed to fetch stock');
    const { stock } = await res.json();
    return stock;
  } catch (err) {
    console.error('Error fetching product stock:', err);
    return 1;
  }
}

// Get products by category
export async function getProductsByCategory(id: string): Promise<Product[]> {
  try {
    const response = await fetch(`${BASE_URL}/products/category/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const products: Product[] = await response.json();
    return products.map(updateProductImage);
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

// Create a new product
export async function createProduct(newProduct: Omit<Product, 'id'>): Promise<Product> {
  try {
    const response = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'bypass-tunnel-reminder': HEADER_VALUE,
      },
      body: JSON.stringify(newProduct),
    });

    if (!response.ok) {
      throw new Error('Failed to create product');
    }

    const product: Product = await response.json();
    return updateProductImage(product);
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

// Update an existing product
export async function updateProduct(id: string, updatedProduct: Omit<Product, 'id'>): Promise<Product> {
  try {
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'bypass-tunnel-reminder': HEADER_VALUE,
      },
      body: JSON.stringify(updatedProduct),
    });

    if (!response.ok) {
      throw new Error('Failed to update product');
    }

    const product: Product = await response.json();
    return updateProductImage(product);
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

// Soft delete a product
export async function deleteProduct(id: string): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'bypass-tunnel-reminder': HEADER_VALUE,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete product');
    }

    console.log('Product deleted successfully');
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}
