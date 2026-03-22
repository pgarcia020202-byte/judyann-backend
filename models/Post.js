const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    tag: { type: String, default: 'General', trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, default: '' },
    status: { type: String, enum: ['published', 'removed'], default: 'published' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
