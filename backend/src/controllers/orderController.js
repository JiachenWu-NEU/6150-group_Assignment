const Order = require("../models/Order");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");

exports.createOrderFromCart = async (req, res) => {
  try {
    const { userId, type } = req.user || {};

    if (type !== "buyer") {
      return res
        .status(403)
        .json({ error: "Only buyer can create orders from cart." });
    }

    const cartItems = await CartItem.find({ buyerId: userId }).populate(
      "productId"
    );

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    const items = [];

    for (const cartItem of cartItems) {
      if (!cartItem.productId) {
        return res
          .status(400)
          .json({ error: "Some products in cart no longer exist." });
      }

      items.push({
        productId: cartItem.productId._id,
        sellerId: cartItem.productId.sellerId,
        quantity: cartItem.quantity,
      });
    }

    const order = await Order.create({
      buyerId: userId,
      purchaseDate: new Date(),
      items,
    });

    await CartItem.deleteMany({ buyerId: userId });

    return res.status(201).json({
      message: "Order created successfully.",
      data: {
        id: order._id,
        buyerId: order.buyerId,
        purchaseDate: order.purchaseDate,
        items: order.items.map((i) => ({
          productId: i.productId,
          sellerId: i.sellerId,
          quantity: i.quantity,
        })),
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    console.error("Error in createOrderFromCart:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const { userId, type } = req.user || {};

    if (type !== "buyer") {
      return res
        .status(403)
        .json({ error: "Only buyer can view own orders." });
    }

    const orders = await Order.find({ buyerId: userId })
      .sort({ purchaseDate: -1 });

    const result = orders.map((order) => ({
      id: order._id,
      buyerId: order.buyerId,
      purchaseDate: order.purchaseDate,
      items: order.items.map((i) => ({
        productId: i.productId,
        sellerId: i.sellerId,
        quantity: i.quantity,
      })),
      createdAt: order.createdAt,
    }));

    return res.status(200).json({
      message: "Get buyer orders successfully.",
      data: result,
    });
  } catch (err) {
    console.error("Error in getMyOrders:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const getVenderOrders = async (req, res) => {
  try {
    const { userId, type } = req.user || {};

    if (type !== "vender") {
      return res
        .status(403)
        .json({ error: "Only vender can view seller orders." });
    }

    const orders = await Order.find({ "items.sellerId": userId })
      .populate("items.productId")
      .sort({ purchaseDate: -1 });

    const result = [];

    for (const order of orders) {
      for (const item of order.items) {
        if (item.sellerId.toString() === userId) {
          const productDoc = item.productId;
          result.push({
            orderId: order._id,
            productId: productDoc?._id || item.productId,
            productName: productDoc?.name,
            quantity: item.quantity,
            purchaseDate: order.purchaseDate,
          });
        }
      }
    }

    return res.status(200).json({
      message: "Get seller orders successfully.",
      data: result,
    });
  } catch (err) {
    console.error("Error in getSellerOrders:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};
