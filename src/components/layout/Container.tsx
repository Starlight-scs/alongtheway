import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'wide';
}

export function Container({ children, className = '', size = 'default' }: ContainerProps) {
  const sizes = {
    narrow: 'max-w-3xl',
    default: 'max-w-5xl',
    wide: 'max-w-7xl',
  };

  return (
    <div className={`mx-auto px-6 md:px-8 ${sizes[size]} ${className}`}>
      {children}
    </div>
  );
}
