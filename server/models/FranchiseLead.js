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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "FranchiseLead",
  franchiseLeadSchema
);