import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`glass-panel rounded-[1.5rem] p-8 ${className}`}>
      {children}
    </div>
  );
}
