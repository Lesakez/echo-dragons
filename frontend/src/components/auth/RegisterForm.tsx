// src/components/auth/RegisterForm.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../store/slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterForm.scss';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: any) => state.auth);

  const validateForm = () => {
    let isValid = true;
    const errors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    // Проверка имени пользователя
    if (!formData.username.trim()) {
      errors.username = 'Имя пользователя обязательно';
      isValid = false;
    } else if (formData.username.length < 3) {
      errors.username = 'Имя пользователя должно содержать не менее 3 символов';
      isValid = false;
    } else if (formData.username.length > 20) {
      errors.username = 'Имя пользователя должно содержать не более 20 символов';
      isValid = false;
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = 'Имя пользователя может содержать только буквы, цифры, символы _ и -';
      isValid = false;
    }

    // Проверка email
    if (!formData.email.trim()) {
      errors.email = 'Email обязателен';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Пожалуйста, введите корректный email';
      isValid = false;
    }

    // Проверка пароля
    if (!formData.password) {
      errors.password = 'Пароль обязателен';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль должен содержать не менее 6 символов';
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(formData.password)) {
      errors.password = 'Пароль должен содержать хотя бы одну строчную букву, одну заглавную букву и одну цифру';
      isValid = false;
    }

    // Проверка подтверждения пароля
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
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
      const { username, email, password } = formData;
      const result = await dispatch(register({ username, email, password }));
      
      if (register.fulfilled.match(result)) {
        // Регистрация успешна, перенаправляем на страницу создания персонажа
        navigate('/character/create');
      }
    }
  };

  return (
    <div className="register-form-container">
      <div className="register-form-wrapper">
        <h2>Регистрация</h2>
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={formErrors.username ? 'error' : ''}
            />
            {formErrors.username && (
              <div className="input-error">{formErrors.username}</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={formErrors.email ? 'error' : ''}
            />
            {formErrors.email && (
              <div className="input-error">{formErrors.email}</div>
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
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Подтверждение пароля</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={formErrors.confirmPassword ? 'error' : ''}
            />
            {formErrors.confirmPassword && (
              <div className="input-error">{formErrors.confirmPassword}</div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="register-button" 
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <div className="login-link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;