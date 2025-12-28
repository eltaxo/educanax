'use client'

import { Button } from '@/components/ui/button';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = 'Copiar' }: CopyButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    // Opcional: mostrar feedback
  };

  return (
    <Button variant="outline" onClick={handleCopy}>
      {label}
    </Button>
  );
}
