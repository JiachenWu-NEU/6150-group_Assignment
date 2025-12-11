import { API_BASE_URL } from "./api";
import { getAuthToken } from "../utils/auth";

// ==================== 卖家商品管理 ====================


export const getMyProducts = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/product/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const result = await response.json();
  return result;
};

// 创建新商品
export const createProduct = async (formData) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/product/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData, // FormData 不需要设置 Content-Type
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create product");
  }

  return await response.json();
};

// 更新商品信息
export const updateProduct = async (productId, productData) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update product");
  }

  return await response.json();
};

// 更新商品上下架状态
export const updateProductAvailability = async (productId, isOnSale) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/product/${productId}/onsale`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isOnSale }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update product availability");
  }

  return await response.json();
};

// 删除商品
export const deleteProduct = async (productId) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete product");
  }

  return await response.json();
};

// ==================== 卖家订单管理 ====================

// 获取卖家的销售记录
export const getVenderOrders = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/order/vender`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch vender orders");
  }

  return await response.json();
};

// ==================== 卖家个人信息 ====================

// 获取卖家个人信息（使用通用的用户接口）
export const getSellerProfile = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch seller profile");
  }

  return await response.json();
};

// 更新卖家个人信息
export const updateSellerProfile = async (profileData) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/user/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update seller profile");
  }

  return await response.json();
};
