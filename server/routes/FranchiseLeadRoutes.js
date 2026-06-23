import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import express from "express";
import FranchiseLead from "../models/FranchiseLead.js";

const router = express.Router();
console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS =", process.env.EMAIL_PASS);
console.log("PASS LENGTH =", process.env.EMAIL_PASS?.length);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.log("EMAIL ERROR:", error);
  } else {
    console.log("EMAIL SERVER READY");
  }
});
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, city } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required.",
      });
    }

    const lead = await FranchiseLead.create({
      name,
      phone,
      email,
      city,
    });

    const info = await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: "mrwashwala@gmail.com",
  subject: "New Franchise Brochure Lead",
  html: `
    <h2>New Franchise Brochure Download</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Email:</strong> ${email || "Not Provided"}</p>
    <p><strong>City:</strong> ${city || "Not Provided"}</p>
  `,
});

console.log("EMAIL SENT:", info.messageId);
    res.status(201).json({
      success: true,
      message: "Lead captured successfully.",
      data: lead,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

export default router;