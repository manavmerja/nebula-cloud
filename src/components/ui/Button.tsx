import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'icon';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  disabled,
  ...props
}: ButtonProps) => {

  // 1. Base Styles (Layout, Transitions, Focus)
  const baseStyles = "relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0F1117]";

  // 2. Size Variants
  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    icon: "p-2 rounded-lg",
  };

  // 3. Visual Variants (The "Pro" Look)
  const variants = {
    primary: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 border border-transparent active:scale-95",
    secondary: "bg-[#1A1D26] border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 hover:bg-[#232732] active:scale-95",
    outline: "bg-transparent border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 active:scale-95",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/50 active:scale-95",
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {/* Loading Spinner */}
      {isLoading && <Loader2 className="w-4 h-4 animate-spin absolute" />}

      {/* Content (Hidden when loading to preserve width) */}
      <span className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {icon}
        {children}
      </span>
    </button>
  );
};