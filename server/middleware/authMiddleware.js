import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const CANDIDATE_SECRETS = [
  process.env.JWT_SECRET,
  'careconnect_super_secret_jwt_key_2026_production',
  'careconnect_secret_key'
].filter(Boolean);

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      let decoded = null;
      for (const secret of CANDIDATE_SECRETS) {
        try {
          decoded = jwt.verify(token, secret);
          if (decoded) break;
        } catch {
          // Continue to next candidate secret
        }
      }

      if (!decoded || !decoded.id) {
        return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
      }
      
      // Attach user info to req
      if (req.app.locals.useMemoryDb) {
        const user = req.app.locals.inMemoryDb?.users?.find(u => String(u._id) === String(decoded.id));
        if (!user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        // Exclude hashed password from req.user
        const { password: _, ...userSafe } = user;
        req.user = userSafe;
      } else {
        if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
          return res.status(401).json({ message: 'Not authorized, invalid user token ID' });
        }
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
      }
      return next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
