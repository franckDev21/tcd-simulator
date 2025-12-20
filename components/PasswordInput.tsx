import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  showIcon?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = '••••••••',
  className = '',
  showIcon = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      {showIcon && (
        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      )}
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-glass-200 border border-glass-border rounded-xl ${showIcon ? 'pl-10' : 'pl-4'} pr-10 py-3 text-sm outline-none focus:border-blue-500 transition-all ${className}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

export default PasswordInput;
