// 存储token和用户信息到localStorage
export const setAuthToken = (token) => {
  localStorage.setItem("token", token);
};

export const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const removeAuthToken = () => {
  localStorage.removeItem("token");
};

// 存储用户信息
export const setUserInfo = (userInfo) => {
  localStorage.setItem("userInfo", JSON.stringify(userInfo));
};

export const getUserInfo = () => {
  const userInfo = localStorage.getItem("userInfo");
  return userInfo ? JSON.parse(userInfo) : null;
};

export const removeUserInfo = () => {
  localStorage.removeItem("userInfo");
};

// 清除所有认证信息
export const logout = () => {
  removeAuthToken();
  removeUserInfo();
};

// 检查是否已登录
export const isAuthenticated = () => {
  return !!getAuthToken();
};
