import mongoose from "mongoose";

const franchiseLeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      default: "",
      trim: true,
      lowercase: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Interested', 'Closed', 'Rejected'],
      default: 'New',
      trim: true,
    },
    assignedTo: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    branch: {
      id: { type: String, default: null },
      name: { type: String, default: null }
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "FranchiseLead",
  franchiseLeadSchema
);