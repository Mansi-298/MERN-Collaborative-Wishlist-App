const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist'); // Adjust to your actual model path
const auth = require('../middleware/auth'); // Your auth middleware

// Get all wishlists for a specific user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Check if the requesting user matches the userId parameter or has admin rights
    if (req.user.id !== req.params.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const wishlists = await Wishlist.find({ userId: req.params.userId });
    res.json(wishlists);
  } catch (err) {
    console.error('Error in GET /wishlist/user/:userId:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new wishlist
router.post('/', auth, async (req, res) => {
  try {
    const { name, userId } = req.body;
    
    // Ensure the user is creating a wishlist for themselves
    if (req.user.id !== userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const newWishlist = new Wishlist({
      name,
      userId,
      products: []
    });

    const savedWishlist = await newWishlist.save();
    res.json(savedWishlist);
  } catch (err) {
    console.error('Error in POST /wishlist:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a product to a wishlist
router.post('/:wishlistId/product', auth, async (req, res) => {
  try {
    const { name, image, createdBy } = req.body;
    
    // Find the wishlist
    const wishlist = await Wishlist.findById(req.params.wishlistId);
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Ensure the user owns this wishlist
    if (wishlist.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Add the product
    const newProduct = {
      name,
      image,
      createdBy
    };

    wishlist.products.push(newProduct);
    const updatedWishlist = await wishlist.save();
    
    res.json(updatedWishlist);
  } catch (err) {
    console.error('Error in POST /wishlist/:wishlistId/product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a wishlist
router.delete('/:wishlistId', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.wishlistId);
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Ensure the user owns this wishlist
    if (wishlist.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    await Wishlist.findByIdAndDelete(req.params.wishlistId);
    res.json({ message: 'Wishlist deleted' });
  } catch (err) {
    console.error('Error in DELETE /wishlist/:wishlistId:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a product from a wishlist
router.delete('/:wishlistId/product/:productId', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.wishlistId);
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Ensure the user owns this wishlist
    if (wishlist.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Filter out the product to remove
    wishlist.products = wishlist.products.filter(
      product => product._id.toString() !== req.params.productId
    );
    
    const updatedWishlist = await wishlist.save();
    res.json(updatedWishlist);
  } catch (err) {
    console.error('Error in DELETE /wishlist/:wishlistId/product/:productId:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;