import express from "express";
import FranchiseLead from "../models/FranchiseLead.js";

const router = express.Router();

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