import express from 'express';
import { validateAdminCredentials, signAdminToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const isValid = await validateAdminCredentials(email, password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signAdminToken({ role: 'admin', email });
    return res.status(200).json({ token, expiresIn: process.env.JWT_EXPIRES_IN || '2h' });
  } catch (error) {
    console.error('Admin login error:', error.message);
    return res.status(500).json({ message: 'Failed to login', error: error.message });
  }
});

export default router;
