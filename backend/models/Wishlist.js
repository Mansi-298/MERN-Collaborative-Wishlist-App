const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  image: String,
  createdBy: String,
  time: { type: Date, default: Date.now },
});

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  products: [productSchema],
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
