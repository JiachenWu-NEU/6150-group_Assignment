const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
router.use("/user", userRoutes);

const productRoutes = require("./productRoutes");
router.use("/product", productRoutes);

module.exports = router;