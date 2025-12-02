import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  onClick?: () => void;
  title?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = "", 
  noPadding = false,
  onClick,
  title
}) => {
  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden bg-glass-100 backdrop-blur-xl border border-glass-border rounded-2xl shadow-2xl ${noPadding ? '' : 'p-6'} ${className}`}
    >
      {title && (
        <div className="mb-4 text-xl font-bold">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: LucideIcon;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = "", 
  icon: Icon,
  loading,
  ...props 
}) => {
  const baseStyles = "relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 border border-transparent",
    secondary: "bg-glass-200 text-white hover:bg-glass-300 border border-glass-border backdrop-blur-md",
    danger: "bg-red-500/20 text-red-200 hover:bg-red-500/30 border border-red-500/30",
    ghost: "bg-transparent text-slate-300 hover:text-white hover:bg-white/5"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {loading ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </button>
  );
};

export const ProgressBar: React.FC<{ value: number; max: number; label?: string }> = ({ value, max, label }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">{label}</div>}
      <div className="h-2 w-full bg-glass-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};