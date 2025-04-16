export interface Product {
  id: string;
  name: string;
  rating: number;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  image: string;

  images?: {
    url: string;
    altText?: string;
    order: number;
  }[];
}

const BASE_URL = "http://localhost:3000/api";
// The uploads endpoint (assuming Express.static serves images from /uploads)
const IMAGE_BASE_URL = "http://localhost:3000/uploads";

const BYPASS_TUNNEL_HEADER = "ngrok-skip-browser-warning";
const HEADER_VALUE = "your-custom-value"; // Set your custom header value here

// Helper function: Ensures a valid image URL string is assigned to product.image.
function updateProductImage(product: Product): Product {
  const imageUrl =
    product.images && product.images.length > 0
      ? `${product.images.sort((a, b) => a.order - b.order)[0].url}`
      : `${IMAGE_BASE_URL}/placeholder.png`;

  return {
    ...product,
    image: imageUrl,
  };
}

// Get all products
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${BASE_URL}/products`, {
      headers: {
        [BYPASS_TUNNEL_HEADER]: HEADER_VALUE,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch products");
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
        [BYPASS_TUNNEL_HEADER]: HEADER_VALUE,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }

    const product: Product = await response.json();
    // console.log(product);
    return updateProductImage(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

// Get product stock
export async function getProductStock(id: string): Promise<number> {
  try {
    const res = await fetch(`${BASE_URL}/products/stock/${id}`);
    if (!res.ok) throw new Error("Failed to fetch stock");
    const { stock } = await res.json();
    return stock;
  } catch (err) {
    console.error("Error fetching product stock:", err);
    return 1;
  }
}

// Get products by category
export async function getProductsByCategory(id: string): Promise<Product[]> {
  try {
    const response = await fetch(`${BASE_URL}/products/category/${id}`, {
      headers: {
        [BYPASS_TUNNEL_HEADER]: HEADER_VALUE,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const products: Product[] = await response.json();
    return products.map(updateProductImage);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
}

// Create a new product
export async function createProduct(
  newProduct: Omit<Product, "id" | "image" | "images">
): Promise<Product> {
  try {
    const response = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [BYPASS_TUNNEL_HEADER]: HEADER_VALUE,
      },
      body: JSON.stringify(newProduct),
    });

    if (!response.ok) {
      throw new Error("Failed to create product");
    }

    const product: Product = await response.json();
    return updateProductImage(product);
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

// Update an existing product
export async function updateProduct(
  id: string,
  updatedProduct: Omit<Product, "id" | "image" | "images">
): Promise<Product> {
  try {
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        [BYPASS_TUNNEL_HEADER]: HEADER_VALUE,
      },
      body: JSON.stringify(updatedProduct),
    });

    if (!response.ok) {
      throw new Error("Failed to update product");
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
      method: "DELETE",
      headers: {
        [BYPASS_TUNNEL_HEADER]: HEADER_VALUE,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete product");
    }

    console.log("Product deleted successfully");
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}
