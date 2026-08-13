import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    unit: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    features: {
      type: [String],
      default: []
    },
    featured: {
      type: Boolean,
      default: false
    },
    displayType: {
      type: String,
      enum: ['main', 'customize'],
      default: 'main'
    },
    customizeCategory: {
      type: String,
      trim: true,
      default: ''
    },
    customizeSubcategory: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Service = mongoose.model('Service', serviceSchema);

export default Service;
