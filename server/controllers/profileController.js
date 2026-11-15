import User from '../models/User.js';

export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const user = db.users.find(u => String(u._id) === String(userId));
      if (!user) return res.status(404).json({ message: 'Profile not found' });
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        phone: user.phone,
        profile: user.profile
      });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Profile not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, dob, phone, bloodGroup, allergies, existingConditions, emergencyContact, relevantNotes } = req.body;

    const parseList = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return String(val).split(',').map(s => s.trim()).filter(Boolean);
    };

    if (req.app.locals.useMemoryDb) {
      const db = req.app.locals.inMemoryDb;
      const user = db.users.find(u => String(u._id) === String(userId));
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (name !== undefined) user.name = name.trim();
      if (dob !== undefined) user.dob = dob;
      if (phone !== undefined) user.phone = phone;

      user.profile = {
        bloodGroup: bloodGroup !== undefined ? bloodGroup : (user.profile?.bloodGroup || 'Not specified'),
        allergies: allergies !== undefined ? parseList(allergies) : (user.profile?.allergies || []),
        existingConditions: existingConditions !== undefined ? parseList(existingConditions) : (user.profile?.existingConditions || []),
        emergencyContact: emergencyContact || (user.profile?.emergencyContact || { name: '', phone: '', relation: '' }),
        relevantNotes: relevantNotes !== undefined ? relevantNotes : (user.profile?.relevantNotes || '')
      };

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        phone: user.phone,
        profile: user.profile
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined) user.name = name.trim();
    if (dob !== undefined) user.dob = dob;
    if (phone !== undefined) user.phone = phone;

    user.profile = {
      bloodGroup: bloodGroup !== undefined ? bloodGroup : (user.profile?.bloodGroup || 'Not specified'),
      allergies: allergies !== undefined ? parseList(allergies) : (user.profile?.allergies || []),
      existingConditions: existingConditions !== undefined ? parseList(existingConditions) : (user.profile?.existingConditions || []),
      emergencyContact: emergencyContact || (user.profile?.emergencyContact || { name: '', phone: '', relation: '' }),
      relevantNotes: relevantNotes !== undefined ? relevantNotes : (user.profile?.relevantNotes || '')
    };

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      dob: updatedUser.dob,
      phone: updatedUser.phone,
      profile: updatedUser.profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
