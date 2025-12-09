const Product = require("../models/Product");

exports.createProduct = async (req, res) => {
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

exports.updateProduct = async (req, res) => {
  try {
    const { userId, type } = req.user || {};
    const { id } = req.params;
    const { name, price, description, isOnSale } = req.body;

    if (type !== "vender") {
      return res.status(403).json({ error: "Only vender can update products." });
    }

    if (
      !name &&
      typeof price === "undefined" &&
      !description &&
      typeof isOnSale === "undefined"
    ) {
      return res.status(400).json({
        error:
          "At least one field (name, price, description, isOnSale) is required.",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    if (product.sellerId.toString() !== userId) {
      return res.status(403).json({ error: "You can only update your own products." });
    }

    if (name) product.name = name;

    if (typeof price !== "undefined") {
      const priceNumber = Number(price);
      if (Number.isNaN(priceNumber) || priceNumber < 0) {
        return res
          .status(400)
          .json({ error: "price must be a non-negative number." });
      }
      product.price = priceNumber;
    }

    if (description) product.description = description;

    if (typeof isOnSale !== "undefined") {
      if (typeof isOnSale === "string") {
        product.isOnSale = isOnSale.toLowerCase() === "true";
      } else {
        product.isOnSale = !!isOnSale;
      }
    }

    await product.save();

    return res.status(200).json({
      message: "Product updated successfully.",
      data: {
        id: product._id,
        sellerId: product.sellerId,
        name: product.name,
        price: product.price,
        imagePath: product.imagePath,
        description: product.description,
        isOnSale: product.isOnSale,
      },
    });
  } catch (err) {
    console.error("Error in updateProduct:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { userId, type } = req.user || {};
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    if (type === "vender") {
      if (product.sellerId.toString() !== userId) {
        return res
          .status(403)
          .json({ error: "You can only delete your own products." });
      }
    } else if (type !== "admin") {
      return res
        .status(403)
        .json({ error: "Only vender or admin can delete products." });
    }

    await product.deleteOne();

    return res.status(200).json({
      message: "Product deleted successfully.",
      data: {
        id: product._id,
        sellerId: product.sellerId,
        name: product.name,
        price: product.price,
        imagePath: product.imagePath,
        description: product.description,
        isOnSale: product.isOnSale,
      },
    });
  } catch (err) {
    console.error("Error in deleteProduct:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.updateProductAvailability = async (req, res) => {
  try {
    const { userId, type } = req.user || {};
    const { id } = req.params;
    const { isOnSale } = req.body;

    if (type !== "vender") {
      return res
        .status(403)
        .json({ error: "Only vender can update product availability." });
    }

    if (typeof isOnSale === "undefined") {
      return res
        .status(400)
        .json({ error: "isOnSale field is required." });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    if (product.sellerId.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You can only update your own products." });
    }

    let isOnSaleValue;
    if (typeof isOnSale === "string") {
      isOnSaleValue = isOnSale.toLowerCase() === "true";
    } else {
      isOnSaleValue = !!isOnSale;
    }

    product.isOnSale = isOnSaleValue;
    await product.save();

    return res.status(200).json({
      message: "Product availability updated successfully.",
      data: {
        id: product._id,
        sellerId: product.sellerId,
        name: product.name,
        price: product.price,
        imagePath: product.imagePath,
        description: product.description,
        isOnSale: product.isOnSale,
      },
    });
  } catch (err) {
    console.error("Error in updateProductAvailability:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const result = products.map((p) => ({
      id: p._id,
      sellerId: p.sellerId,
      name: p.name,
      price: p.price,
      imagePath: p.imagePath,
      description: p.description,
      isOnSale: p.isOnSale,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return res.status(200).json({
      message: "Get all products successfully.",
      data: result,
    });
  } catch (err) {
    console.error("Error in getAllProducts:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};