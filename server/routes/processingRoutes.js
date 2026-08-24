import express from 'express';
import OrderProcessing from '../models/OrderProcessing.js';
import Order from '../models/Order.js';
import WalkInOrder from '../models/WalkInOrder.js';
import { WORKFLOWS } from '../config/workflows.js';
import { adminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(adminAuth);

// @desc    Get all active processing tickets
// @route   GET /api/processing/active
router.get('/active', async (req, res) => {
  try {
    const activeTickets = await OrderProcessing.find({
      status: { $in: ['New', 'In Progress', 'Needs Attention', 'Ready'] }
    }).sort({ createdAt: 1 });
    res.json(activeTickets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch processing tickets', error: error.message });
  }
});

// @desc    Get single processing ticket
// @route   GET /api/processing/:id
router.get('/:id', async (req, res) => {
  try {
    const ticket = await OrderProcessing.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ ticket, workflow: WORKFLOWS[ticket.workflowKey] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch ticket', error: error.message });
  }
});

// @desc    Start current step
// @route   POST /api/processing/:id/start
router.post('/:id/start', async (req, res) => {
  try {
    const ticket = await OrderProcessing.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.status === 'Completed' || ticket.status === 'Ready') {
      return res.status(400).json({ message: 'Cannot start completed ticket' });
    }

    const workflow = WORKFLOWS[ticket.workflowKey];
    const currentStepDef = workflow.steps[ticket.currentStepIndex];

    // Check if there is an uncompleted history entry for the current step
    let historyEntry = ticket.history.find(
      h => h.step === currentStepDef.id && h.completedAt == null
    );

    if (!historyEntry) {
      ticket.history.push({
        step: currentStepDef.id,
        startedAt: new Date(),
        completedAt: null
      });
    } else if (!historyEntry.startedAt) {
      historyEntry.startedAt = new Date();
    }

    if (ticket.status === 'New' || ticket.status === 'Needs Attention') {
      ticket.status = 'In Progress';
    }

    await ticket.save();
    res.json({ ticket, workflow });
  } catch (error) {
    res.status(500).json({ message: 'Failed to start step', error: error.message });
  }
});

// @desc    Complete current step (with optional QC)
// @route   POST /api/processing/:id/complete
router.post('/:id/complete', async (req, res) => {
  try {
    const { qcResult } = req.body; // 'Pass', 'Needs Rework', or null
    const ticket = await OrderProcessing.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const workflow = WORKFLOWS[ticket.workflowKey];
    const currentStepDef = workflow.steps[ticket.currentStepIndex];

    if (currentStepDef.requiresQc && !qcResult) {
      return res.status(400).json({ message: 'Quality check is required for this step' });
    }

    let historyEntry = ticket.history.find(
      h => h.step === currentStepDef.id && h.completedAt == null
    );

    const now = new Date();

    if (!historyEntry) {
      // If it wasn't started explicitly, preserve startedAt and complete it now
      historyEntry = {
        step: currentStepDef.id,
        startedAt: ticket.updatedAt || now,
        completedAt: now,
        qcResult: qcResult || null
      };
      ticket.history.push(historyEntry);
    } else {
      if (!historyEntry.startedAt) {
        historyEntry.startedAt = ticket.updatedAt || now;
      }
      historyEntry.completedAt = now;
      historyEntry.qcResult = qcResult || null;
    }

    if (qcResult === 'Needs Rework') {
      ticket.status = 'Needs Attention';
      // Rework stays on the same step index, just increments count for the new attempt
      ticket.history.push({
        step: currentStepDef.id,
        startedAt: now,
        completedAt: null,
        reworkCount: (historyEntry.reworkCount || 0) + 1
      });
    } else {
      // Pass or no QC
      ticket.currentStepIndex += 1;
      ticket.status = 'In Progress';

      if (ticket.currentStepIndex >= workflow.steps.length) {
        ticket.status = 'Completed';
        // Try to update parent order status if all tickets for it are complete
        await updateParentOrderStatus(ticket.orderId, ticket.orderType, 'Delivered'); // Or ready
      } else {
        const nextStep = workflow.steps[ticket.currentStepIndex];
        if (nextStep.id === 'ready') {
          ticket.status = 'Ready';
          await updateParentOrderStatus(ticket.orderId, ticket.orderType, 'Ready');
        }
        // Auto-record startedAt for the newly entered stage!
        ticket.history.push({
          step: nextStep.id,
          startedAt: now,
          completedAt: null
        });
      }
    }

    await ticket.save();
    res.json({ ticket, workflow });
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete step', error: error.message });
  }
});

async function updateParentOrderStatus(orderId, orderType, newStatus) {
  try {
    if (orderType === 'Order') {
      await Order.findOneAndUpdate({ orderId }, { status: newStatus });
    } else {
      await WalkInOrder.findOneAndUpdate({ orderId }, { status: newStatus });
    }
  } catch (e) {
    console.error('Failed to update parent order status', e);
  }
}

export default router;
