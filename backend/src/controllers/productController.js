const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    const { userId, type } = req.user || {};

    if (type !== "vender") {
      return res.status(403).json({ error: "Only vender can create products." });
    }

    const { name, price, description, isOnSale } = req.body;

    if (!name || !price || !description) {
      return res
        .status(400)
        .json({ error: "name, price and description are required." });
    }

    const priceNumber = Number(price);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      return res.status(400).json({ error: "price must be a non-negative number." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Product image is required." });
    }

    const imagePath = `/images/${req.file.filename}`;

    let isOnSaleValue = true;
    if (typeof isOnSale !== "undefined") {
      if (typeof isOnSale === "string") {
        isOnSaleValue = isOnSale.toLowerCase() === "true";
      } else {
        isOnSaleValue = !!isOnSale;
      }
    }

    const product = await Product.create({
      sellerId: userId,
      name,
      price: priceNumber,
      imagePath,
      description,
      isOnSale: isOnSaleValue,
    });

    return res.status(201).json({
      message: "Product created successfully.",
      data: {
        id: product._id,
        sellerId: product.sellerId,
        name: product.name,
        price: product.price,
        imagePath: product.imagePath,
        description: product.description,
        isOnSale: product.isOnSale,
        createdAt: product.createdAt,
      },
    });
  } catch (err) {
    console.error("Error in createProduct:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  createProduct,
};