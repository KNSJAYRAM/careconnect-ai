import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'careconnect_secret_key', {
    expiresIn: '30d',
  });
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, dob, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const existing = db.users.find(u => u.email === cleanEmail);
      if (existing) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: 'user_' + Date.now(),
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        dob: dob || '',
        phone: phone || '',
        profile: {
          bloodGroup: 'Not specified',
          allergies: [],
          existingConditions: [],
          emergencyContact: { name: '', phone: '', relation: '' },
          relevantNotes: ''
        },
        createdAt: new Date()
      };
      db.users.push(newUser);

      return res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        dob: newUser.dob,
        phone: newUser.phone,
        profile: newUser.profile,
        token: generateToken(newUser._id)
      });
    }

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      dob: dob || '',
      phone: phone || ''
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      dob: user.dob,
      phone: user.phone,
      profile: user.profile,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const user = db.users.find(u => u.email === cleanEmail || (cleanEmail === 'demo@example.com' && u.email === 'jayram@example.com'));
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        phone: user.phone,
        profile: user.profile,
        token: generateToken(user._id)
      });
    }

    const searchEmails = cleanEmail === 'demo@example.com' ? ['demo@example.com', 'jayram@example.com'] : [cleanEmail];
    const user = await User.findOne({ email: { $in: searchEmails } });
    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        phone: user.phone,
        profile: user.profile,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: 'User not found' });
    const userObj = user.toObject ? user.toObject() : { ...user };
    const { password: _, ...userWithoutPassword } = userObj;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const user = db.users.find(u => String(u._id) === String(userId));
      if (!user) return res.status(404).json({ message: 'User not found' });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      return res.json({ message: 'Password updated successfully' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
