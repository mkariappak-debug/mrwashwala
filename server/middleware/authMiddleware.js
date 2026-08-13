import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const getJwtSecret = () => process.env.JWT_SECRET || 'mrwashwala_secret_change_this';
const getJwtExpiry = () => process.env.JWT_EXPIRES_IN || '2h';
const getAdminEmail = () => process.env.ADMIN_EMAIL?.trim() || undefined;
const getAdminPassword = () => process.env.ADMIN_PASSWORD?.trim() || undefined;
const getAdminPasswordHash = () => process.env.ADMIN_PASSWORD_HASH?.trim() || undefined;

export const signAdminToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: getJwtExpiry() });
};

export const validateAdminCredentials = async (email, password) => {
  const adminEmail = getAdminEmail();
  const adminPassword = getAdminPassword();
  const adminPasswordHash = getAdminPasswordHash();

  if (!adminEmail || (!adminPassword && !adminPasswordHash)) {
    throw new Error('Admin credentials are not configured');
  }

  if (email !== adminEmail) {
    return false;
  }

  if (adminPasswordHash) {
    return bcrypt.compare(password, adminPasswordHash);
  }

  return password === adminPassword;
};

export const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: admin access only' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Admin auth error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired authorization token' });
  }
};
