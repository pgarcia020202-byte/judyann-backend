const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { protect, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/users', protect, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/users/:id/status', protect, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (req.params.id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot change own status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = status;
    await user.save();

    const updated = await User.findById(user._id).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/posts', protect, requireAdmin, async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/posts/:id/status', protect, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['published', 'removed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.status = status;
    await post.save();

    const populated = await Post.findById(post._id).populate('author', 'name email');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
