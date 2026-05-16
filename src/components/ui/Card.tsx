import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-linen rounded-xl p-8 ${className}`}>
      {children}
    </div>
  );
}
