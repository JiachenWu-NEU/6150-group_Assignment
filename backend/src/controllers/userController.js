const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, type } = req.body;

    if (!username || !email || !password || !type) {
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
    });

    return res.status(201).json({
      message: "User created successfully.",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        type: user.type,
        createdAt: user.createdAt,
      }
    });
  } catch (err) {
    console.error("Error in createUser:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};