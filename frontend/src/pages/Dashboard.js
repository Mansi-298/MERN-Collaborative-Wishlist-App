import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../dashboard.css';

const Dashboard = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isSignUp) {
        await axios.post('http://localhost:5000/api/auth/signup', { email, password });
        alert('Signup successful!');
      } else {
        res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        const token = res.data.token;  // Correctly extract the token
        if (token) {
          localStorage.setItem('token', token);  // Store token in localStorage
          console.log('Login response:', res);   // Log the response for debugging
          navigate('/wishlist');
        } else {
          throw new Error('No token returned in response.');
        }
      }
    } catch (err) {
      console.error('Error during authentication:', err);
      alert(err.response ? err.response.data.message : 'An error occurred during authentication');
    }
  };
  

  return (
    <div className="auth-container">
  <div className="auth-card">
    <h1 className="auth-title">Collaborative Wishlist App</h1>
    <form onSubmit={handleAuth} className="auth-form">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="auth-input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="auth-input"
      />
      <button
        type="submit"
        className={`auth-button ${isSignUp ? 'signup' : 'login'}`}
      >
        {isSignUp ? 'Sign Up' : 'Login'}
      </button>
    </form>
    <button onClick={() => setIsSignUp(!isSignUp)} className="toggle-button">
      {isSignUp ? 'Already have an account? Login' : 'Don’t have an account? Sign Up'}
    </button>
  </div>
</div>

  );
};

export default Dashboard;
