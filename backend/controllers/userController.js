import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointementModel from "../models/appointementModel.js";

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Check if user exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      userData: user,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching profile",
    });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dob, gender } = req.body;
    const updates = { name, phone, dob, gender };

    // Handle address if provided
    if (address) {
      try {
        updates.address = JSON.parse(address);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Invalid address format",
        });
      }
    }

    // Handle image upload if provided
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "user-profiles",
          resource_type: "image",
        });
        updates.image = result.secure_url;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading image",
        });
      }
    }

    // Update user
    const updatedUser = await userModel
      .findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
      })
      .select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      userData: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating profile",
    });
  }
};

// api to book appointment

const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.user.id; // Get userId from authenticated user

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData || !docData.available) {
      return res.status(404).json({
        success: false,
        message: "Doctor not available",
      });
    }

    let slot_booked = docData.slots_booked;

    // Check for slot availability
    if (slot_booked[slotDate] && slot_booked[slotDate].includes(slotTime)) {
      return res.status(400).json({
        success: false,
        message: "Slot not available",
      });
    }

    const userData = await userModel.findById(userId).select("-password");

    const appointmentData = {
      userId,
      doctorId: docId,
      slotDate,
      slotTime,
      userData,
      docData: {
        _id: docData._id,
        name: docData.name,
        speciality: docData.speciality,
        image: docData.image,
        fee: docData.fee,
        address: {
          line1: docData.address.line1 || "",
          line2: docData.address.line2 || "",
        },
      },
      amount: docData.fee,
      date: Date.now(),
    };

    // Create appointment
    const newAppointment = new appointementModel(appointmentData);
    await newAppointment.save();

    // Update doctor's booked slots
    if (!slot_booked[slotDate]) {
      slot_booked[slotDate] = [];
    }
    slot_booked[slotDate].push(slotTime);

    await doctorModel.findByIdAndUpdate(docId, {
      slots_booked: slot_booked,
    });

    res.json({
      success: true,
      message: "Appointment booked successfully",
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//api to get user appointement

const listAppointment = async (req, res) => {
  try {
    const userId = req.user.id; // Changed from req.body to use the authenticated user
    const appointments = await appointementModel.find({ userId });

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// api to cencel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.user.id;

    // 1. Find the appointment and verify ownership
    const appointment = await appointementModel.findOneAndUpdate(
      {
        _id: appointmentId,
        userId,
        cancelled: false, // Only uncancelled appointments
      },
      { cancelled: true },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or already cancelled",
      });
    }

    // 2. Free up the doctor's slot
    await doctorModel.findByIdAndUpdate(appointment.doctorId, {
      $pull: {
        [`slots_booked.${appointment.slotDate}`]: appointment.slotTime,
      },
    });

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error("Cancellation error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
};
