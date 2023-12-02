import User from "../models/user.js";
import Comment from "../models/comments.js";
import env from "dotenv";
import bcrypt from "bcryptjs";
import {
  sendEmail,
  verifyEmail,
  generateUniqueToken,
} from "./authController.js";
env.config();

const createUser = async (req, res) => {
  try {
    const { username, password, email, fullname, birthdate, phone, gender } =
      req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a verification token
    const verificationToken = generateUniqueToken();

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      verificationToken,
      isVerified: false,
      role: 0,
      img: "",
      fullname,
      birthdate,
      role: 0,
      img: "",
      fullname: "",
      birthdate: "",
      phone: "",
      gender: "",
      street: "",
      city: "",
    });

    const existUsername = await User.findOne({ username });
    const existEmail = await User.findOne({ email });

    if (existUsername) {
      return res.status(400).json({ message: "Username already taken!" });
    }
    if (existEmail) {
      return res.status(400).json({ message: "Email already taken!" });
    }

    await newUser.save();

    await sendEmail(email, verificationToken);

    res.json({
      message: "Register successfully, check your email",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Đã xảy ra lỗi.");
  }
};

const editUser = async (req, res) => {
  try {
    const { fullname, birthdate, phone, gender, street, city, img } = req.body;
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    user.fullname = fullname || user.fullname;
    user.birthdate = birthdate || user.birthdate;
    user.phone = phone || user.phone;
    user.gender = gender || user.gender;
    user.street = street || user.street;
    user.city = city || user.city;
    if (req.file) {
      user.img = req.file.filename;
    }

    await user.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while updating profile");
  }
};
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching user profile");
  }
};
const getAllUsers = async (req, res) => {
  try {
    console.log(req.cookies);
    const users = await User.find({ role: [0] });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found!" });
    }

    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching users");
  }
};
const getAllUsersComments = async (req, res) => {
  try {
    const comments = await Comment.find();

    if (!comments || comments.length === 0) {
      return res.status(404).json({ message: "No comments found!" });
    }

    res.json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching users");
  }
};

const deleteUsersbyID = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while fetching user profile");
  }
};


const deleteListUsersByIds = async (req, res) => {
  try {
    const listIdDelete = req.body; 

    if (!listIdDelete || listIdDelete.length === 0) {
      return res.status(400).json({ message: "No user IDs provided for deletion!" });
    }

    const deletedUsers = await User.deleteMany({ _id: { $in: listIdDelete } });

    if (deletedUsers.deletedCount === 0) {
      return res.status(404).json({ message: "No users found for the provided IDs!" });
    }

    res.json({ message: "Users deleted successfully", deletedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while deleting users");
  }
};

const blockUserbyID = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (user.status === "Blocked") {
      user.status = "Normal";
    } else {
      user.status = "Blocked";
    }

    await user.save();

    res.json({ message: "User status updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error while updating user status");
  }
};

export {
  createUser,
  editUser,
  getUserProfile,
  getAllUsers,
  getAllUsersComments,
  sendEmail,
  verifyEmail,
  deleteUsersbyID,
  deleteListUsersByIds,
  blockUserbyID,
};
