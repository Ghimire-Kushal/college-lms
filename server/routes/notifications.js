const express = require('express');
const router  = express.Router();
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');

// GET /api/notifications — current user's notifications (latest 30)
router.get('/', auth, async (req, res) => {
  try {
    const notifs = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/:id/read — mark one as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { read: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/read-all — mark all as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
