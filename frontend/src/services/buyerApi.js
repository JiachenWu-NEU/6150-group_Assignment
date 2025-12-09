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

// ==================== Mock数据（临时用，等后端接口好了删除） ====================

// Mock 商品列表
export const mockGetProducts = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    data: [
      {
        id: "1",
        sellerId: "seller1",
        sellerName: "TechGuru",
        sellerRating: 4.8,
        name: "iPhone 13 Pro 128GB",
        price: 699,
        originalPrice: 999,
        image: "https://via.placeholder.com/300x300?text=iPhone+13",
        images: [
          "https://via.placeholder.com/600x600?text=iPhone+13+Front",
          "https://via.placeholder.com/600x600?text=iPhone+13+Back",
          "https://via.placeholder.com/600x600?text=iPhone+13+Side",
          "https://via.placeholder.com/600x600?text=iPhone+13+Box",
        ],
        description:
          "Like new condition iPhone 13 Pro in Graphite color. This phone has been carefully maintained and comes with all original accessories including the box, charging cable, and unused stickers. The battery health is at 95% and there are absolutely no scratches or dents on the device.",
        condition: "Like New",
        category: "Electronics",
        location: "Boston, MA",
        isOnSale: true,
        createdAt: "2024-11-20",
        specifications: {
          Storage: "128GB",
          Color: "Graphite",
          "Battery Health": "95%",
          Condition: "Like New - No scratches",
          Warranty: "No warranty",
          Accessories: "Original box, cable, stickers",
        },
      },
    ],
  };
};

// Mock 单个商品详情
export const mockGetProductById = async (productId) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const response = await mockGetProducts();
  const product = response.data.find((p) => p.id === productId);

  return {
    success: true,
    data: product || null,
  };
};

// Mock 购物车
export const mockGetCart = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));

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
          sellerId: "seller1",
          sellerName: "TechGuru",
          isAvailable: true,
        },
      ],
    },
  };
};

// Mock 更新购物车商品数量
export const mockUpdateCartItem = async (cartItemId, quantity) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log("Updating cart item:", cartItemId, "new quantity:", quantity);

  return {
    success: true,
    message: "Cart updated successfully",
  };
};

// Mock 删除购物车商品
export const mockRemoveFromCart = async (cartItemId) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log("Removing cart item:", cartItemId);

  return {
    success: true,
    message: "Item removed from cart",
  };
};

// Mock 清空购物车
export const mockClearCart = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log("Clearing entire cart");

  return {
    success: true,
    message: "Cart cleared",
  };
};
