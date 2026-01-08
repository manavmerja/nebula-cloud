import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
  className?: string
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ size = 'md', variant = 'default', className = '', children, ...props }, ref) => {
    const sizeClasses =
      size === 'sm' ? 'px-3 py-1.5 text-sm h-8' : size === 'lg' ? 'px-6 py-3 text-base h-12' : 'px-4 py-2 text-sm h-10'

    const variantClasses =
      variant === 'outline'
        ? 'bg-transparent border border-border text-foreground hover:bg-card'
        : 'bg-primary text-primary-foreground hover:bg-primary/90'

    return (
      <button ref={ref} className={`inline-flex items-center justify-center rounded-md font-medium transition ${sizeClasses} ${variantClasses} ${className}`} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
