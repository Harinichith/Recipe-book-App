import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* REGISTER USER */
/**
 * Registers a new user in the database.
 * Hashes the password and saves the user object in the database.
 * Returns the saved user object in the response.
 */
export const register = async (req, res) => {
  try {
    console.log("🔍 Registration Request Received:");
    console.log("Request Body:", JSON.stringify(req.body, null, 2));
    console.log("Request File:", req.file);

    const {
      firstName,
      lastName,
      email,
      password,
      picture,
    } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picture: picture || req.file?.filename || "",
    });

    console.log("🚀 Attempting to save user:", newUser);

    const savedUser = await newUser.save();
    console.log("✅ User saved successfully:", savedUser);

    res.status(201).json(savedUser);
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ 
      error: err.message,
      details: err.toString(),
      stack: err.stack 
    });
  }
};

/* LOGGING IN */

/**
 * Logs in an existing user.
 * Finds the user with the given email in the database.
 * Compares the hashed password with the provided password.
 * If the password matches, generates a JWT token and sends it in the response along with the user object.
 */
export const login = async (req, res) => {
  try {
    console.log("🔍 Login Request Received:");
    console.log("Request Body:", JSON.stringify(req.body, null, 2));

    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      console.warn(`❌ Login attempt for non-existent user: ${email}`);
      return res.status(400).json({ msg: "User does not exist. " });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.warn(`❌ Invalid password attempt for user: ${email}`);
      return res.status(400).json({ msg: "Invalid credentials. " });
    }

    console.log(`✅ Successful login for user: ${email}`);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    delete user.password;
    res.status(200).json({ token, user });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ 
      error: err.message,
      details: err.toString(),
      stack: err.stack 
    });
  }
};