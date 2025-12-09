import { getAuthToken } from "../utils/auth";

const API_BASE_URL = "http://localhost:5000/api";

// Common request function
const request = async (url, options = {}) => {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Get all products (on sale)
export const getProducts = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  return request(`/products?${queryParams}`);
};

// Get single product details
export const getProductById = async (productId) => {
  return request(`/products/${productId}`);
};

// Add to cart
export const addToCart = async (productId, quantity = 1) => {
  return request("/cart", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
};

// ===== Mock data - delete when backend API is ready =====
export const mockGetProducts = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    data: [
      {
        id: "1",
        sellerId: "seller1",
        name: "iPhone 13 Pro 128GB",
        price: 699,
        image: "https://via.placeholder.com/300x300?text=iPhone+13",
        description:
          "Like new condition, no scratches. Comes with all accessories. Selling because upgrading to new model.",
        isOnSale: true,
        createdAt: "2024-11-20",
      },
      {
        id: "2",
        sellerId: "seller2",
        name: "MacBook Air M2 2023",
        price: 899,
        image: "https://via.placeholder.com/300x300?text=MacBook+Air",
        description:
          "Almost brand new, only used for 2 months. 8GB RAM + 256GB SSD configuration.",
        isOnSale: true,
        createdAt: "2024-11-18",
      },
      {
        id: "3",
        sellerId: "seller1",
        name: "Sony WH-1000XM5 Headphones",
        price: 249,
        image: "https://via.placeholder.com/300x300?text=Sony+Headphones",
        description:
          "Used for 6 months, excellent condition. Amazing noise cancellation.",
        isOnSale: true,
        createdAt: "2024-11-15",
      },
      {
        id: "4",
        sellerId: "seller3",
        name: 'iPad Pro 11" 2022',
        price: 649,
        image: "https://via.placeholder.com/300x300?text=iPad+Pro",
        description: "Wi-Fi model, 128GB, includes Apple Pencil 2nd Gen.",
        isOnSale: true,
        createdAt: "2024-11-10",
      },
      {
        id: "5",
        sellerId: "seller2",
        name: "Nintendo Switch OLED",
        price: 299,
        image: "https://via.placeholder.com/300x300?text=Switch",
        description: "International version, includes 3 game cartridges.",
        isOnSale: true,
        createdAt: "2024-11-05",
      },
      {
        id: "6",
        sellerId: "seller3",
        name: "Canon EOS R6 Camera",
        price: 1899,
        image: "https://via.placeholder.com/300x300?text=Canon+R6",
        description:
          "Professional full-frame mirrorless camera, shutter count under 1000.",
        isOnSale: true,
        createdAt: "2024-11-01",
      },
    ],
  };
};
