const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "alitimig_jwt_secret";


exports.register = async (req, res) => {
  try {
    const { username, email, password, type, address, isAvailable } = req.body || {};

    if (!username || !email || !password || !type || !address) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already in use." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      type,
      address,
      isAvailable,
    });

    return res.status(201).json({
      message: "User created successfully.",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        type: user.type,
        address: user.address,
        isAvailable: user.isAvailable,
        createdAt: user.createdAt,
      }
    });
  } catch (err) {
    console.error("Error in createUser:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        type: user.type,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successfully.",
      data: {
        type: user.type,
        token,
      },
    });
  } catch (err) {
    console.error("Error in loginUser:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, address } = req.body || {};

    if (!username && !address) {
      return res
        .status(400)
        .json({ error: "At least one field (username or address) is required." });
    }

    const updateFields = {};
    if (username) updateFields.username = username;
    if (address) updateFields.address = address;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json({
      message: "User updated successfully.",
      data: {
        username: user.username,
        email: user.email,
        type: user.type,
        address: user.address,
        isAvailable: user.isAvailable,
      },
    });
  } catch (err) {
    console.error("Error in updateUser:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.disableUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { isAvailable: false } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json({
      message: "User disabled successfully.",
      data: {
        username: user.username,
        email: user.email,
        type: user.type,
        address: user.address,
        isAvailable: user.isAvailable,
      },
    });
  } catch (err) {
    console.error("Error in disableUser:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const result = users.map((u) => ({
      id: u._id,
      username: u.username,
      email: u.email,
      type: u.type,
      address: u.address,
      isAvailable: u.isAvailable,
    }));

    return res.status(200).json({
      message: "Get all users successfully.",
      data: result,
    });
  } catch (err) {
    console.error("Error in getAllUsers:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json({
      message: "User deleted successfully.",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        type: user.type,
      },
    });
  } catch (err) {
    console.error("Error in deleteUser:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};