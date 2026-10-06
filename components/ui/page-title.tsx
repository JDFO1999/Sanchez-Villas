import React from 'react';
import { cn } from '@/lib/utils';

interface PageTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

/** Título de página único del sistema. El estilo vive en `.page-title` (globals.css). */
export function PageTitle({ children, className, ...props }: PageTitleProps) {
  return (
    <h1 className={cn("page-title", className)} {...props}>
      {children}
    </h1>
  );
}
