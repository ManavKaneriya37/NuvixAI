const User = require("../models/user.model");
const bcrypt = require("bcrypt");

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
      return res.status(400).json({ message: "User already exists" });
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
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 }); // 1 hour

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { email, fullname: { firstname, lastname } },
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ message: "Signup: Internal server error" });
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

    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 }); // 1 hour

    res.status(200).json({
      message: "Login successful",
      token,
      user: { email, fullname: user.fullname },
    });
  } catch (error) {
    console.error("Error logging in user:", error.message);
    res.status(500).json({ message: "Login: Internal server error" });
  }
}

module.exports = {
  registerUser,
  loginUser,
};
