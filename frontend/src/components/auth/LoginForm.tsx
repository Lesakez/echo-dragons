// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import './LoginForm.scss';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({
    emailOrUsername: '',
    password: ''
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: any) => state.auth);

  const validateForm = () => {
    let isValid = true;
    const errors = {
      emailOrUsername: '',
      password: ''
    };

    // Проверка email/имени пользователя
    if (!formData.emailOrUsername.trim()) {
      errors.emailOrUsername = 'Пожалуйста, введите email или имя пользователя';
      isValid = false;
    }

    // Проверка пароля
    if (!formData.password) {
      errors.password = 'Пожалуйста, введите пароль';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Сбрасываем ошибку при изменении поля
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Сбрасываем серверную ошибку
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const result = await dispatch(login(formData));
      
      if (login.fulfilled.match(result)) {
        // Вход успешен, перенаправляем на главную страницу
        navigate('/');
      }
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-form-wrapper">
        <h2>Вход в игру</h2>
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="emailOrUsername">Email или имя пользователя</label>
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
            <label htmlFor="password">Пароль</label>
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
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        
        <div className="register-link">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;