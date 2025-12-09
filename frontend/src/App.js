import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductList from "./components/buyer/ProductList";
import ProductDetail from "./components/buyer/ProductDetail";
import Cart from "./components/buyer/Cart";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        {/* 其他路由之后添加 */}
      </Routes>
    </Router>
  );
}

export default App;
