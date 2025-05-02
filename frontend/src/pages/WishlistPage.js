import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const WishlistPage = () => {
  const [wishlists, setWishlists] = useState([]);
  const [newWishlistName, setNewWishlistName] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', image: '', createdBy: '' });
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedWishlistId, setSelectedWishlistId] = useState(null);
  const [inviteStatus, setInviteStatus] = useState('');

  useEffect(() => {
    // Get user ID from token when component mounts
    const getUserIdFromToken = () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in again.');
          setIsLoading(false);
          return null;
        }

        const decodedToken = jwtDecode(token);
        if (!decodedToken || !decodedToken.id) {
          setError('Invalid authentication token. Please log in again.');
          setIsLoading(false);
          return null;
        }

        return decodedToken.id;
      } catch (err) {
        console.error('Error decoding token:', err);
        setError('Authentication error. Please log in again.');
        setIsLoading(false);
        return null;
      }
    };

    const userId = getUserIdFromToken();
    setUserId(userId);
    
    if (userId) {
      fetchWishlists(userId);
    }
  }, []);

  // Fetch wishlists with the userId
  const fetchWishlists = async (id) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/wishlist/user/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setWishlists(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching wishlists:', err);
      setError('Failed to fetch wishlists. Please try again later.');
      setIsLoading(false);
    }
  };

  // Create a new wishlist
  const handleCreateWishlist = async () => {
    if (!newWishlistName.trim()) return;
    
    try {
      const res = await axios.post('http://localhost:5000/api/wishlist', 
        { name: newWishlistName, userId },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setWishlists([...wishlists, res.data]);
      setNewWishlistName('');
    } catch (err) {
      console.error('Error creating wishlist:', err);
      setError('Failed to create wishlist. Please try again.');
    }
  };

  // Add product to wishlist
  const handleAddProduct = async (wishlistId) => {
    if (!newProduct.name.trim()) return;
    
    try {
      const productToAdd = {
        ...newProduct,
        createdBy: userId
      };
      
      const res = await axios.post(`http://localhost:5000/api/wishlist/${wishlistId}/product`, 
        productToAdd,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Update the wishlist in state
      const updatedWishlists = wishlists.map(wishlist => 
        wishlist._id === wishlistId ? res.data : wishlist
      );
      
      setWishlists(updatedWishlists);
      setNewProduct({ name: '', image: '', createdBy: '' });
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product. Please try again.');
    }
  };

  // Delete a wishlist
  const handleDeleteWishlist = async (wishlistId) => {
    try {
      await axios.delete(`http://localhost:5000/api/wishlist/${wishlistId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Remove the deleted wishlist from state
      const updatedWishlists = wishlists.filter(wishlist => wishlist._id !== wishlistId);
      setWishlists(updatedWishlists);
    } catch (err) {
      console.error('Error deleting wishlist:', err);
      setError('Failed to delete wishlist. Please try again.');
    }
  };

  // Remove a product from a wishlist
  const handleRemoveProduct = async (wishlistId, productId) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/wishlist/${wishlistId}/product/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Update the wishlist in state
      const updatedWishlists = wishlists.map(wishlist => 
        wishlist._id === wishlistId ? res.data : wishlist
      );
      
      setWishlists(updatedWishlists);
    } catch (err) {
      console.error('Error removing product:', err);
      setError('Failed to remove product. Please try again.');
    }
  };

  // Open invite form for a specific wishlist
  const openInviteForm = (wishlistId) => {
    setSelectedWishlistId(wishlistId);
    setShowInviteForm(true);
    setInviteEmail('');
    setInviteStatus('');
  };

  // Close invite form
  const closeInviteForm = () => {
    setShowInviteForm(false);
    setSelectedWishlistId(null);
    setInviteEmail('');
  };

  // Send invite email
  const sendInvite = async (e) => {
    e.preventDefault();
    setInviteStatus('Sending invitation...');
    
    if (!inviteEmail.trim()) {
      setInviteStatus('Please enter an email address');
      return;
    }
    
    if (!selectedWishlistId) {
      setInviteStatus('Please select a wishlist');
      return;
    }
    
    try {
      console.log('Sending invite with data:', {
        email: inviteEmail,
        wishlistId: selectedWishlistId,
        wishlistName: wishlists.find(w => w._id === selectedWishlistId)?.name || 'Wishlist'
      });
      
      // Find the wishlist name for the email content
      const wishlist = wishlists.find(w => w._id === selectedWishlistId);
      
      const response = await axios.post(
        'http://localhost:5000/api/wishlist/invite', 
        { 
          email: inviteEmail, 
          wishlistId: selectedWishlistId,
          wishlistName: wishlist ? wishlist.name : 'Wishlist'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('Invite response:', response.data);
      setInviteStatus('Invitation sent successfully!');
      setTimeout(() => {
        closeInviteForm();
      }, 2000);
    } catch (err) {
      console.error('Error sending invitation:', err);
      if (err.response) {
        // Get more detailed error information
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        setInviteStatus(`Failed to send invitation: ${err.response.data.details || err.response.data.message || 'Unknown error'}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setInviteStatus('Failed to send invitation. No response from server.');
      } else {
        // Something happened in setting up the request
        console.error('Error setting up request:', err.message);
        setInviteStatus(`Failed to send invitation: ${err.message}`);
      }
    }
  };
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (isLoading) {
    return <div>Loading wishlists...</div>;
  }

  if (!userId) {
    return <div>Please log in to view your wishlists.</div>;
  }

  return (
    <div className="wishlist-container">
      <h1>Your Wishlists</h1>
      
      {/* Create new wishlist form */}
      <div className="create-wishlist">
        <input
          type="text"
          value={newWishlistName}
          onChange={(e) => setNewWishlistName(e.target.value)}
          placeholder="New wishlist name"
        />
        <button onClick={handleCreateWishlist}>Create Wishlist</button>
      </div>
      
      {/* Display wishlists */}
      {wishlists.length === 0 ? (
        <p>You don't have any wishlists yet.</p>
      ) : (
        <div className="wishlists-grid">
          {wishlists.map(wishlist => (
            <div key={wishlist._id} className="wishlist-card">
              <div className="wishlist-header">
                <h2>{wishlist.name}</h2>
                <div className="wishlist-actions">
                  <button 
                    onClick={() => openInviteForm(wishlist._id)}
                    className="invite-button"
                  >
                    Invite
                  </button>
                  <button 
                    onClick={() => handleDeleteWishlist(wishlist._id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {/* Products list */}
              <div className="products-list">
                {wishlist.products && wishlist.products.length > 0 ? (
                  wishlist.products.map(product => (
                    <div key={product._id} className="product-item">
                      {product.image && (
                        <img src={product.image} alt={product.name} />
                      )}
                      <div className="product-details">
                        <p>{product.name}</p>
                        <button 
                          onClick={() => handleRemoveProduct(wishlist._id, product._id)}
                          className="remove-button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No products in this wishlist yet.</p>
                )}
              </div>
              
              {/* Add product form */}
              <div className="add-product-form">
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Product name"
                />
                <input
                  type="text"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                  placeholder="Image URL (optional)"
                />
                <button onClick={() => handleAddProduct(wishlist._id)}>
                  Add Product
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteForm && (
        <div className="invite-modal">
          <div className="invite-modal-content">
            <h3>Invite Someone to Your Wishlist</h3>
            <form onSubmit={sendInvite}>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
              <div className="invite-buttons">
                <button type="submit">Send Invitation</button>
                <button type="button" onClick={closeInviteForm}>Cancel</button>
              </div>
            </form>
            {inviteStatus && <p className="invite-status">{inviteStatus}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;