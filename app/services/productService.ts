export interface Product {
    image: string | undefined;
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
  }

    
  const BASE_URL = "http://localhost:3000/api";
  const BYPASS_TUNNEL_HEADER = 'ngrok-skip-browser-warning';
  const HEADER_VALUE = 'your-custom-value'; // Set your custom value here
  
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
      return products;
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
      return product;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  }

  export async function getProductsByCategory(id: string){
    try {
      const response = await fetch(`${BASE_URL}/products/category/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const products: Product[] = await response.json();
      return products;
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
      return product;
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
      return product;
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
  