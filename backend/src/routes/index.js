const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
router.use("/user", userRoutes);

const productRoutes = require("./productRoutes");
router.use("/product", productRoutes);

const cartRoutes = require("./cartRoutes");
router.use("/cart", cartRoutes);

const orderRoutes = require("./orderRoutes");
router.use("/order", orderRoutes);

module.exports = router;