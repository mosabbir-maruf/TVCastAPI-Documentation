'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'hover:bg-muted active:bg-muted/80',
        'h-8 w-8',
        'absolute top-2 right-2',
        className
      )}
      aria-label="Copy code"
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-600" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}

