// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, clearError } from '../../store/slices/authSlice';
import { AppDispatch } from '../../types/redux';
import Button from '../ui/Button';
import FormInput from '../ui/FormInput';
import Card from '../ui/Card';

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

    // Проверка email/username
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
    
    // Очистка ошибки при изменении поля
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Очистка серверной ошибки
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const result = await dispatch(login(formData));
      
      if (login.fulfilled.match(result)) {
        // Вход успешен, перенаправление на главную
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="max-w-md w-full">
        <h2 className="text-3xl font-display text-primary text-center mb-6">Вход в игру</h2>
        
        {error && (
          <div className="p-3 mb-4 rounded-md bg-accent/20 border border-accent text-accent text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            id="emailOrUsername"
            name="emailOrUsername"
            label="Email или имя пользователя"
            value={formData.emailOrUsername}
            onChange={handleChange}
            error={formErrors.emailOrUsername}
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
          
          <Button 
            type="submit" 
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти в игру'}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-text-secondary">
          Нет аккаунта? <Link to="/register" className="text-primary hover:text-primary/80">Зарегистрироваться</Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;