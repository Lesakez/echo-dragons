// src/components/auth/RegisterForm.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, clearError } from '../../store/slices/authSlice';
import { AppDispatch } from '../../types/redux';
import Button from '../ui/Button';
import FormInput from '../ui/FormInput';
import Card from '../ui/Card';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: any) => state.auth);

  const validateForm = () => {
    let isValid = true;
    const errors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

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

    if (!formData.email.trim()) {
      errors.email = 'Email обязателен';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Пожалуйста, введите корректный email';
      isValid = false;
    }

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

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
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
        navigate('/character/create');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="max-w-md w-full">
        <h2 className="text-3xl font-display text-primary text-center mb-6">Регистрация</h2>
        
        {error && (
          <div className="p-3 mb-4 rounded-md bg-accent/20 border border-accent text-accent text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            id="username"
            name="username"
            label="Имя пользователя"
            value={formData.username}
            onChange={handleChange}
            error={formErrors.username}
            required
          />
          
          <FormInput
            id="email"
            name="email"
            type="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            required
          />
          
          <FormInput
            id="password"
            name="password"
            type="password"
            label="Пароль"
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            required
          />
          
          <FormInput
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Подтверждение пароля"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={formErrors.confirmPassword}
            required
          />
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-text-secondary">
          Уже есть аккаунт? <Link to="/login" className="text-primary hover:text-primary/80">Войти</Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterForm;