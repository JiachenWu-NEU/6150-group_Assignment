const CartItem = require("../models/CartItem");
const Product = require("../models/Product");

function ensureBuyer(req, res) {
  const { type } = req.user || {};
  if (type !== "buyer") {
    res.status(403).json({ error: "Only buyer can operate cart." });
    return false;
  }
  return true;
}

exports.addToCart = async (req, res) => {
  try {
    if (!ensureBuyer(req, res)) return;

    const buyerId = req.user.userId;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "productId is required." });
    }

    let qty = quantity == null ? 1 : Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res
        .status(400)
        .json({ error: "quantity must be a positive number." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    let item = await CartItem.findOne({ buyerId, productId });

    if (item) {
      item.quantity += qty;
      await item.save();
    } else {
      item = await CartItem.create({
        buyerId,
        productId,
        quantity: qty,
      });
    }

    return res.status(200).json({
      message: "Product added to cart successfully.",
      data: {
        id: item._id,
        buyerId: item.buyerId,
        productId: item.productId,
        quantity: item.quantity,
      },
    });
  } catch (err) {
    console.error("Error in addToCart:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    if (!ensureBuyer(req, res)) return;

    const buyerId = req.user.userId;
    const { productId } = req.body || {};

    if (!productId) {
      return res.status(400).json({ error: "productId is required." });
    }

    const item = await CartItem.findOneAndDelete({ buyerId, productId });

    if (!item) {
      return res.status(404).json({ error: "Cart item not found." });
    }

    return res.status(200).json({
      message: "Product removed from cart successfully.",
      data: {
        id: item._id,
        buyerId: item.buyerId,
        productId: item.productId,
        quantity: item.quantity,
      },
    });
  } catch (err) {
    console.error("Error in removeFromCart:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.updateCartQuantity = async (req, res) => {
  try {
    if (!ensureBuyer(req, res)) return;

    const buyerId = req.user.userId;
    const { productId, quantity } = req.body || {};

    if (!productId) {
      return res.status(400).json({ error: "productId is required." });
    }

    if (quantity == null) {
      return res.status(400).json({ error: "quantity is required." });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty)) {
      return res.status(400).json({ error: "quantity must be a number." });
    }

    const item = await CartItem.findOne({ buyerId, productId });

    if (!item) {
      return res.status(404).json({ error: "Cart item not found." });
    }

    if (qty <= 0) {
      await item.deleteOne();
      return res.status(200).json({
        message: "Cart item removed because quantity <= 0.",
        data: {
          id: item._id,
          buyerId: item.buyerId,
          productId: item.productId,
          quantity: item.quantity,
        },
      });
    }

    item.quantity = qty;
    await item.save();

    return res.status(200).json({
      message: "Cart item quantity updated successfully.",
      data: {
        id: item._id,
        buyerId: item.buyerId,
        productId: item.productId,
        quantity: item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    });
  } catch (err) {
    console.error("Error in updateCartQuantity:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};