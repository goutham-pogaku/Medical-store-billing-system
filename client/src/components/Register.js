import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    storeName: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    gstNumber: '',
    licenseNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  // sanitize inputs as user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Allow only letters, numbers and spaces for names/store name
    if (name === 'ownerName' || name === 'storeName') {
      newValue = value.replace(/[^a-zA-Z0-9 ]/g, '');
    }

    // Allow only digits for phone and limit to 10 characters
    if (name === 'phone') {
      newValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }

    // clear specific field error on change
    setFieldErrors(prev => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });

    setFormData({
      ...formData,
      [name]: newValue
    });
  };

  const validateEmailFormat = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const errs = {};

    if (!formData.storeName.trim()) {
      errs.storeName = 'Store name is required';
    }
    if (formData.ownerName.trim().length < 2) {
      errs.ownerName = 'Owner name should be at least 2 characters';
    }
    if (formData.phone.length < 10) {
      errs.phone = 'Phone number must be 10 digits';
    }

    // Email/password checks added
    if (!validateEmailFormat(formData.email)) {
      errs.email = 'Invalid email format';
    }
    if (!formData.password || formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});

    console.log('=== REGISTRATION ATTEMPT ===');
    console.log('Form Data:', JSON.stringify(formData, null, 2));

    if (!validateForm()) {
      console.log('Client-side validation failed');
      return;
    }

    console.log('Client-side validation passed, sending to server...');
    const result = await register(formData);
    console.log('Registration result:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Registration successful!');
      setSuccess('Registration successful! You can now login.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Parse server validation details if present
    console.error('❌ Registration failed:', JSON.stringify(result.error, null, 2));
    
    if (result.error && result.error.details && Array.isArray(result.error.details)) {
      console.log('Server validation errors:', JSON.stringify(result.error.details, null, 2));
      const errs = {};
      result.error.details.forEach(d => {
        console.log(`Field error - ${d.path || d.param}: ${d.msg}`);
        const fieldName = d.path || d.param;
        if (fieldName) errs[fieldName] = d.msg || 'Invalid value';
      });
      setFieldErrors(prev => ({ ...prev, ...errs }));
      setError(`Validation failed: ${result.error.details.map(d => d.msg).join(', ')}`);
    } else if (result.error && result.error.status === 500) {
      // Server error - show helpful message
      console.error('💡 Server Error (500) - Check Render logs for database issues');
      setError(result.error.userMessage || 'Server error. Please contact support or check backend logs.');
    } else if (result.error && typeof result.error === 'object') {
      console.log('Error object:', JSON.stringify(result.error, null, 2));
      const errorMsg = result.error.userMessage || result.error.message || result.error.error || JSON.stringify(result.error);
      setError(errorMsg);
    } else if (typeof result.error === 'string') {
      setError(result.error);
    } else {
      setError('Registration failed. Please check the console for details.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h2>Register Medical Store</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Store Name:</label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                required
              />
              {fieldErrors.storeName && <div className="field-error">{fieldErrors.storeName}</div>}
            </div>
            
            <div className="form-group">
              <label>Owner Name:</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                required
              />
              {fieldErrors.ownerName && <div className="field-error">{fieldErrors.ownerName}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
            </div>
            
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {fieldErrors.phone && <div className="field-error">{fieldErrors.phone}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
            </div>
            
            <div className="form-group">
              <label>Confirm Password:</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {fieldErrors.confirmPassword && <div className="field-error">{fieldErrors.confirmPassword}</div>}
            </div>
          </div>
          
          <div className="form-group">
            <label>Address:</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>GST Number:</label>
              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>License Number:</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
              {Object.keys(fieldErrors).length > 0 && (
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  {Object.entries(fieldErrors).map(([field, msg]) => (
                    <li key={field}>{field}: {msg}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {success && <div className="success-message">{success}</div>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;