import React from 'react';
import { IosSpinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-background gap-4">
      <IosSpinner size={48} color="#22c55e" />
      <p className="text-muted-foreground font-medium animate-pulse">Cargando...</p>
    </div>
  );
}
