'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-sage text-cream shadow-[0_10px_30px_rgba(88,102,80,0.28)] hover:bg-sage-dark hover:-translate-y-0.5',
      secondary: 'bg-transparent text-charcoal border border-border hover:bg-oat',
      text: 'text-sage underline underline-offset-4 hover:text-sage-dark px-0 py-0',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Submitting...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
