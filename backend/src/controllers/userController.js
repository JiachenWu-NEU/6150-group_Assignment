const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "alitimig_jwt_secret";


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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

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