import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'wide';
}

export function Container({ children, className = '', size = 'default' }: ContainerProps) {
  const sizes = {
    narrow: 'max-w-xl',
    default: 'max-w-2xl',
    wide: 'max-w-4xl',
  };

  return (
    <div className={`mx-auto px-6 md:px-8 ${sizes[size]} ${className}`}>
      {children}
    </div>
  );
}
