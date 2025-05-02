const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const User = require('../models/User');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

// All existing routes...
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
      products: [],
      sharedWith: [] // Initialize empty array for shared users
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
    
    // Ensure the user owns this wishlist or has been shared with
    if (wishlist.userId.toString() !== req.user.id && 
        !wishlist.sharedWith.includes(req.user.id)) {
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
    
    // Ensure the user owns this wishlist or it has been shared with them
    if (wishlist.userId.toString() !== req.user.id && 
        !wishlist.sharedWith.includes(req.user.id)) {
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

// NEW ROUTE: Send email invitation for a wishlist
router.post('/invite', auth, async (req, res) => {
    try {
      console.log('Invite endpoint called with body:', req.body);
      console.log('Authenticated user ID:', req.user.id);
      
      const { email, wishlistId, wishlistName } = req.body;
      
      // Validate inputs
      if (!email || !wishlistId) {
        console.log('Missing required fields');
        return res.status(400).json({ message: 'Email and wishlistId are required' });
      }
      
      console.log('Finding wishlist with ID:', wishlistId);
      // Find the wishlist
      const wishlist = await Wishlist.findById(wishlistId);
      
      if (!wishlist) {
        console.log('Wishlist not found');
        return res.status(404).json({ message: 'Wishlist not found' });
      }
      
      console.log('Wishlist found:', wishlist.name);
      console.log('Wishlist owner ID:', wishlist.userId);
      console.log('Request user ID:', req.user.id);
      
      // Ensure the user owns this wishlist
      if (wishlist.userId.toString() !== req.user.id) {
        console.log('Unauthorized: User does not own this wishlist');
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Find the inviting user's email
      console.log('Finding inviting user');
      const invitingUser = await User.findById(req.user.id);
      if (!invitingUser) {
        console.log('Inviting user not found');
        return res.status(404).json({ message: 'User not found' });
      }
      
      console.log('Inviting user found:', invitingUser.email);
      
      // Check if the invited user already exists in the system
      console.log('Checking if invited user exists:', email);
      let invitedUser = await User.findOne({ email });
      let invitedUserId = null;
      
      if (invitedUser) {
        console.log('Invited user exists in system with ID:', invitedUser._id);
        invitedUserId = invitedUser._id;
        
        // Check if this user is already in the sharedWith list
        if (wishlist.sharedWith && wishlist.sharedWith.includes(invitedUserId.toString())) {
          console.log('User already has access to this wishlist');
          return res.status(400).json({ message: 'User already has access to this wishlist' });
        }
        
        // Add user to sharedWith list
        console.log('Adding user to sharedWith list');
        if (!wishlist.sharedWith) {
          wishlist.sharedWith = [];
        }
        wishlist.sharedWith.push(invitedUserId);
        await wishlist.save();
        console.log('User added to sharedWith list');
      } else {
        console.log('Invited user does not exist in system');
      }
      
      // For development testing without actual email sending
    //   console.log(`Invitation would be sent to: ${email} for wishlist: ${wishlistName}`);
    //   console.log('Sending success response');
    //   return res.json({ message: 'Invitation sent successfully' });
      
      /* Uncomment this section when you have email configured*/
      // Create a transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        service: 'gmail', // or another email service
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      
      // Create invite link
      const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/wishlist/${wishlistId}`;
      
      // Email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `You've been invited to collaborate on a wishlist: ${wishlistName}`,
        html: `
          <h2>Wishlist Invitation</h2>
          <p>${invitingUser.email} has invited you to collaborate on their wishlist: <strong>${wishlistName}</strong>.</p>
          <p>Click the link below to view and collaborate on this wishlist:</p>
          <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">View Wishlist</a>
          <p>If you don't have an account yet, you'll need to sign up first.</p>
        `
      };
      
      // Send email
      await transporter.sendMail(mailOptions);
      
      res.json({ message: 'Invitation sent successfully' });
      
    } catch (err) {
      console.error('Error in POST /wishlist/invite:', err.message);
      console.error('Full error:', err);
      res.status(500).json({ 
        message: 'Server error', 
        details: err.message 
      });
    }
  });

module.exports = router;