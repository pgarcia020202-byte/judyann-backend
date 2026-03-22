const express = require('express');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, body, tag } = req.body;
    const imageFile = req.file;

    const post = await Post.create({
      title,
      body,
      tag: tag || 'General',
      author: req.user._id,
      image: imageFile ? `/uploads/${imageFile.filename}` : ''
    });

    await post.populate('author', 'name email');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized' });

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
