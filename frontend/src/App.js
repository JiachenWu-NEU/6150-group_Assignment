import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductList from "./components/buyer/ProductList"; // ← 改这里

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/products" element={<ProductList />} />
        {/* 其他路由之后添加 */}
      </Routes>
    </Router>
  );
}

export default App;
