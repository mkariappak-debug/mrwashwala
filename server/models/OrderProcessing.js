import mongoose from 'mongoose';

const OrderProcessingSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    orderType: { type: String, enum: ['Order', 'WalkInOrder'], required: true },
    customerName: { type: String, required: true, trim: true },
    serviceName: { type: String, required: true, trim: true },
    workflowKey: { type: String, required: true },
    currentStepIndex: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['New', 'In Progress', 'Needs Attention', 'Ready', 'Completed'],
      default: 'New'
    },
    history: [
      {
        step: { type: String, required: true },
        startedAt: { type: Date, default: null },
        completedAt: { type: Date, default: null },
        completedBy: { type: String, default: 'Worker' },
        qcResult: { type: String, enum: ['Pass', 'Needs Rework', null], default: null },
        reworkCount: { type: Number, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

const OrderProcessing = mongoose.model('OrderProcessing', OrderProcessingSchema);
export default OrderProcessing;
