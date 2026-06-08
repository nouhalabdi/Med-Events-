import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Register.css';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      setMessage(response.data.message);

      if (response.data.success) {
        setTimeout(() => navigate('/login'), 1500);
      }

    } catch (error) {
      if (error.response) setMessage(error.response.data.message);
      else setMessage('Cannot connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* Background Video */}
      <video className="bg-video" autoPlay muted loop playsInline>
        <source src="/files/bg3.mp4" type="video/mp4" />
      </video>

      <div className="auth-overlay"></div>

      <div className="auth-card">
        <h2>Create Account</h2>

        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input type="text" name="username" placeholder="Username"
              value={formData.username} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <input type="email" name="email" placeholder="Email"
              value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <input type="password" name="password" placeholder="Password"
              value={formData.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <input type="password" name="confirmPassword" placeholder="Confirm Password"
              value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <button className="auth-btn" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Register'}
          </button>
        </form>

        <div className="switch-link">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
}
export default Register;
