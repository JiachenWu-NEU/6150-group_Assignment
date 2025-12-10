// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// 导入买家页面
import ProductList from "./components/buyer/ProductList";
import ProductDetail from "./components/buyer/ProductDetail";
import Cart from "./components/buyer/Cart";

// 卖家页面
import SellerProductList from "./components/seller/SellerProductList";
import AddProduct from "./components/seller/AddProduct";
import SellerProfile from "./components/seller/SellerProfile";

// 导入管理员页面
import AdminLayout from "./components/admin/AdminLayout";
import ProductsPage from "./components/admin/ProductsPage";
import UsersPage from "./components/admin/UsersPage";

// 导入 Material UI 主题
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 创建主题
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* 买家路由 */}
          <Route path="/" element={<ProductList />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />

          {/* 卖家路由 */}
          <Route path="/seller/products" element={<SellerProductList />} />
          <Route path="/seller/add-product" element={<AddProduct />} />
          <Route path="/seller/profile" element={<SellerProfile />} />
          
          {/* 管理员路由 */}
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="users" element={<UsersPage />} />
          </Route>
          
          {/* 默认重定向 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;