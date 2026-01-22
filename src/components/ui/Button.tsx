import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'surface' | 'ghost' | 'danger';
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

  // Base: Flex layout, strict centering, smooth transitions
  const baseStyles = "relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-cyan-500/50";

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    icon: "w-8 h-8 p-0 rounded-lg", // Perfect square for icons
  };

  const variants = {
    // 1. Primary: The "Run" button (Glowing Cyan)
    primary: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-transparent active:scale-[0.98]",

    // 2. Surface: The "Professional Black" button (Save, Dashboard)
    // Dark background, subtle border, lighter text that turns white on hover
    surface: "bg-[#151921] border border-gray-800 hover:border-gray-600 text-gray-400 hover:text-white hover:bg-[#1E222B] active:scale-[0.98]",

    // 3. Ghost: For less important actions
    ghost: "bg-transparent text-gray-500 hover:text-gray-200 hover:bg-white/5",

    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:border-red-500/50",
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin absolute" />}

      {/* Content fades out when loading to keep button width fixed */}
      <span className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {icon}
        {children}
      </span>
    </button>
  );
};