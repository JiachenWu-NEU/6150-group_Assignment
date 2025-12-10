import { request } from "./api";

// ==================== 商品相关 ====================

// 获取所有在售商品
// 在 buyerApi.js 中

// 获取所有在售商品 - 使用真实后端接口
export const getProducts = async (filters = {}) => {
  // 根据接口文档，后端返回格式是：
  // {
  //   "message": "string",
  //   "data": [ { id, sellerId, name, price, imagePath, description, isOnSale } ]
  // }

  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = queryParams ? `/product/all?${queryParams}` : "/product/all";

  try {
    const response = await request(endpoint);
    return {
      success: true,
      data: response.data || response, // 兼容不同的返回格式
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return {
      success: false,
      data: [],
    };
  }
};

// 获取单个商品详情
export const getProductById = async (productId) => {
  try {
    // 先获取所有商品
    const response = await request("/product/all");
    const products = response.data || response;

    // 在所有商品中找到对应的商品
    const product = products.find(
      (p) =>
        String(p.id) === String(productId) ||
        String(p._id) === String(productId)
    );

    if (!product) {
      return {
        success: false,
        data: null,
      };
    }

    // 转换数据格式，添加详情页需要的字段
    const detailedProduct = {
      id: product.id || product._id,
      sellerId: product.sellerId,
      sellerName: product.sellerName || "Anonymous Seller",
      sellerRating: product.sellerRating || 4.5,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || null,
      image:
        product.imagePath ||
        product.image ||
        "https://via.placeholder.com/600x600?text=No+Image",
      // 如果后端没有多张图片，就用同一张图片
      images: product.images || [
        product.imagePath ||
          "https://via.placeholder.com/600x600?text=Product+Image",
        product.imagePath ||
          "https://via.placeholder.com/600x600?text=Product+Image",
        product.imagePath ||
          "https://via.placeholder.com/600x600?text=Product+Image",
        product.imagePath ||
          "https://via.placeholder.com/600x600?text=Product+Image",
      ],
      description: product.description || "No description available",
      condition: product.condition || "Good",
      category: product.category || "General",
      location: product.location || "Unknown Location",
      isOnSale: product.isOnSale,
      createdAt: product.createdAt || new Date().toISOString(),
      specifications: product.specifications || {
        Status: product.isOnSale ? "Available" : "Sold Out",
        "Seller ID": product.sellerId,
      },
    };

    return {
      success: true,
      data: detailedProduct,
    };
  } catch (error) {
    console.error("Failed to fetch product details:", error);
    return {
      success: false,
      data: null,
    };
  }
};

// 搜索商品
export const searchProducts = async (keyword) => {
  try {
    const response = await request("/product/all");
    const products = response.data || response;

    if (!keyword) {
      return {
        success: true,
        data: products,
      };
    }

    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword.toLowerCase()) ||
        p.description.toLowerCase().includes(keyword.toLowerCase())
    );

    return {
      success: true,
      data: filtered,
    };
  } catch (error) {
    console.error("Failed to search products:", error);
    return {
      success: false,
      data: [],
    };
  }
};

// ==================== 购物车相关 ====================

// 获取购物车
export const getCart = async () => {
  try {
    const response = await request("/cart/my");
    // 后端返回格式：
    // {
    //   "message": "string",
    //   "data": [
    //     {
    //       "id": "string",
    //       "productId": "string",
    //       "productName": "string",
    //       "price": 0,
    //       "imagePath": "string",
    //       "quantity": 0
    //     }
    //   ]
    // }
    return {
      success: true,
      data: response.data || [],
    };
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return {
      success: false,
      data: [],
    };
  }
};

// 添加到购物车
export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await request("/cart/add", {
      method: "POST",
      body: JSON.stringify({
        productId: productId,
        quantity: quantity,
      }),
    });

    // 后端返回格式：
    // {
    //   "message": "string",
    //   "data": {
    //     "id": "string",
    //     "buyerId": "string",
    //     "productId": "string",
    //     "quantity": 0
    //   }
    // }

    return {
      success: true,
      data: response.data || response,
      message: response.message || "Product added to cart successfully",
    };
  } catch (error) {
    console.error("Failed to add to cart:", error);
    return {
      success: false,
      message: error.message || "Failed to add to cart",
    };
  }
};

// 更新购物车商品数量
export const updateCartItem = async (productId, quantity) => {
  try {
    const response = await request("/cart/update", {
      method: "PATCH",
      body: JSON.stringify({
        productId: productId,
        quantity: quantity,
      }),
    });

    // 后端返回格式：
    // {
    //   "message": "string",
    //   "data": {
    //     "id": "string",
    //     "buyerId": "string",
    //     "productId": "string",
    //     "quantity": 0
    //   }
    // }

    return {
      success: true,
      data: response.data || response,
      message: response.message || "Cart updated successfully",
    };
  } catch (error) {
    console.error("Failed to update cart:", error);
    return {
      success: false,
      message: error.message || "Failed to update cart",
    };
  }
};

// 删除购物车商品
export const removeFromCart = async (productId) => {
  try {
    const response = await request("/cart/remove", {
      method: "DELETE",
      body: JSON.stringify({
        productId: productId,
      }),
    });

    // 后端返回格式：
    // {
    //   "message": "string",
    //   "data": {
    //     "id": "string",
    //     "buyerId": "string",
    //     "productId": "string",
    //     "quantity": 0
    //   }
    // }

    return {
      success: true,
      data: response.data || response,
      message: response.message || "Product removed from cart",
    };
  } catch (error) {
    console.error("Failed to remove from cart:", error);
    return {
      success: false,
      message: error.message || "Failed to remove from cart",
    };
  }
};

// 清空购物车
export const clearCart = async () => {
  return request("/cart/clear", {
    method: "DELETE",
  });
};

// ==================== 订单相关 ====================

// 创建订单（结账）
export const createOrder = async () => {
  try {
    const response = await request("/order/create", {
      method: "POST",
    });

    // 后端返回格式：
    // {
    //   "message": "Order created successfully.",
    //   "data": {
    //     "id": "string",
    //     "buyerId": "string",
    //     "purchaseDate": "2025-12-10T19:12:11.869Z",
    //     "items": [
    //       {
    //         "productId": "string",
    //         "sellerId": "string",
    //         "quantity": 2
    //       }
    //     ],
    //     "createdAt": "2025-12-10T19:12:11.869Z"
    //   }
    // }

    return {
      success: true,
      data: response.data || response,
      message: response.message || "Order created successfully",
    };
  } catch (error) {
    console.error("Failed to create order:", error);
    return {
      success: false,
      message: error.message || "Failed to create order",
    };
  }
};

// 获取订单历史
export const getOrderHistory = async () => {
  try {
    const response = await request("/order/my");
    return {
      success: true,
      data: response.data || response,
    };
  } catch (error) {
    console.error("Failed to fetch order history:", error);
    return {
      success: false,
      data: [],
    };
  }
};
// 获取单个订单详情
export const getOrderById = async (orderId) => {
  try {
    const response = await request(`/order/${orderId}`);
    return {
      success: true,
      data: response.data || response,
    };
  } catch (error) {
    console.error("Failed to fetch order details:", error);
    return {
      success: false,
      data: null,
    };
  }
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
