import { request } from "./api";

// ==================== 商品相关 ====================

// 获取所有在售商品
export const getProducts = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  return request(`/products?${queryParams}`);
};

// 获取单个商品详情
export const getProductById = async (productId) => {
  return request(`/products/${productId}`);
};

// 搜索商品
export const searchProducts = async (keyword) => {
  return request(`/products/search?keyword=${keyword}`);
};

// ==================== 购物车相关 ====================

// 获取购物车
export const getCart = async () => {
  return request("/cart");
};

// 添加到购物车
export const addToCart = async (productId, quantity = 1) => {
  return request("/cart", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
};

// 更新购物车商品数量
export const updateCartItem = async (cartItemId, quantity) => {
  return request(`/cart/${cartItemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
};

// 删除购物车商品
export const removeFromCart = async (cartItemId) => {
  return request(`/cart/${cartItemId}`, {
    method: "DELETE",
  });
};

// 清空购物车
export const clearCart = async () => {
  return request("/cart/clear", {
    method: "DELETE",
  });
};

// ==================== 订单相关 ====================

// 创建订单（结账）
export const createOrder = async (orderData) => {
  return request("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
};

// 获取订单历史
export const getOrderHistory = async () => {
  return request("/orders");
};

// 获取单个订单详情
export const getOrderById = async (orderId) => {
  return request(`/orders/${orderId}`);
};

// 取消订单
export const cancelOrder = async (orderId) => {
  return request(`/orders/${orderId}/cancel`, {
    method: "PATCH",
  });
};

// ==================== 支付相关 ====================

// 创建支付意图（Stripe）
export const createPaymentIntent = async (amount, orderId) => {
  return request("/payment/create-intent", {
    method: "POST",
    body: JSON.stringify({ amount, orderId }),
  });
};

// 确认支付
export const confirmPayment = async (paymentIntentId) => {
  return request("/payment/confirm", {
    method: "POST",
    body: JSON.stringify({ paymentIntentId }),
  });
};

// ==================== 用户个人信息相关 ====================

// 获取买家个人信息
export const getBuyerProfile = async () => {
  return request("/buyer/profile");
};

// 更新买家个人信息
export const updateBuyerProfile = async (profileData) => {
  return request("/buyer/profile", {
    method: "PATCH",
    body: JSON.stringify(profileData),
  });
};

// 更新买家地址
export const updateBuyerAddress = async (address) => {
  return request("/buyer/address", {
    method: "PATCH",
    body: JSON.stringify({ address }),
  });
};

// ==================== Mock数据（临时用） ====================

export const mockGetProducts = async () => {
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

export const mockGetProductById = async (productId) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const products = (await mockGetProducts()).data;
  const product = products.find((p) => p.id === productId);

  return {
    success: true,
    data: product || null,
  };
};

export const mockGetCart = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    success: true,
    data: {
      items: [
        {
          id: "cart1",
          productId: "1",
          productName: "iPhone 13 Pro 128GB",
          price: 699,
          quantity: 1,
          image: "https://via.placeholder.com/100x100?text=iPhone+13",
        },
      ],
      total: 699,
    },
  };
};
