const User = require("../models/user.model");
const bcrypt = require("bcrypt");

async function getCurrentUser(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
      },
    });
  } catch (error) {
    console.error("Error fetching current user:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch user." });
  }
}

async function registerUser(req, res) {
  const {
    email,
    password,
    fullname: { firstname, lastname },
  } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password
    const hashedPassword = await User.hashPassword(password);

    // Create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
      fullname: {
        firstname,
        lastname,
      },
    });

    await newUser.save();

    // Generate JWT token
    const token = await newUser.generateAuthToken();
    res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days

    res.status(201).json({
      status: true,
      message: "User registered successfully",
      token,
      user: { email, fullname: { firstname, lastname } },
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res
      .status(500)
      .json({ status: false, message: "Something wrong with Signup." });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = await user.generateAuthToken();

    res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000  }); // 7 days

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { email, fullname: user.fullname },
    });
  } catch (error) {
    console.error("Error logging in user:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Something wrong with Login." });
  }
}

function logoutUser(req, res) {
  res.clearCookie("token", { httpOnly: true });
  return res.status(200).json({ success: true, message: "Logged out successfully." });
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
};
