// src/components/ui/FormInput.tsx
import React from 'react';

interface FormInputProps {
  id: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  type = 'text',
  value,
  onChange,
  label,
  placeholder,
  error,
  disabled = false,
  required = false,
  className = '',
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-text-secondary mb-2"
        >
          {label}{required && <span className="text-accent ml-1">*</span>}
        </label>
      )}
      
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full bg-background text-text-primary p-3 rounded-md border ${
          error ? 'border-accent' : 'border-gray-700'
        } focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      />
      
      {error && (
        <div className="mt-1 text-accent text-sm">{error}</div>
      )}
    </div>
  );
};

export default FormInput;