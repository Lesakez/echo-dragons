// frontend/src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch } from '../../types/redux';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({
    emailOrUsername: '',
    password: ''
  });
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: any) => state.auth);

  const validateForm = () => {
    let isValid = true;
    const errors = {
      emailOrUsername: '',
      password: ''
    };

    // Check email/username
    if (!formData.emailOrUsername.trim()) {
      errors.emailOrUsername = 'Please enter an email or username';
      isValid = false;
    }

    // Check password
    if (!formData.password) {
      errors.password = 'Please enter a password';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field changes
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear server error
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const result = await dispatch(login(formData));
      
      // Check if login was successful using the action type
      if (result.type.endsWith('/fulfilled')) {
        // Login successful, redirect to home page
        navigate('/');
      }
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-form-wrapper">
        <h2>Login to the Game</h2>
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="emailOrUsername">Email or Username</label>
            <input
              type="text"
              id="emailOrUsername"
              name="emailOrUsername"
              value={formData.emailOrUsername}
              onChange={handleChange}
              className={formErrors.emailOrUsername ? 'error' : ''}
            />
            {formErrors.emailOrUsername && (
              <div className="input-error">{formErrors.emailOrUsername}</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={formErrors.password ? 'error' : ''}
            />
            {formErrors.password && (
              <div className="input-error">{formErrors.password}</div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="register-link">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;