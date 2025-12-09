import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductList from "./components/buyer/ProductList";
import ProductDetail from "./components/buyer/ProductDetail";
import Cart from "./components/buyer/Cart";

import Navbar from "./components/landingAll/Navbar";
import HeroSection from "./components/landingAll/HeroSection";
import FeatureSection from "./components/landingAll/FeatureSection";
import Footer from "./components/landingAll/Footer";
import RegisterPage from "./components/register/RegisterPage";
import LoginPage from "./components/login/LoginPage";
function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<> <HeroSection /> <FeatureSection /><Footer /></>}/>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        {/* 其他路由之后添加 */}
      </Routes>
    </Router>
  );
}

export default App;
