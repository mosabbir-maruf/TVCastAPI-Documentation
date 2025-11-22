'use client';

import Link from 'next/link';
import type { MouseEvent } from 'react';
import { Mail } from 'lucide-react';

import { cn } from '@/lib/utils';

type SupportButtonProps = {
  className?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function SupportButton({ className, onClick }: SupportButtonProps) {
  return (
    <Link
      href="/maintainer#contact"
      prefetch
      className={cn(
        'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-[1.01]',
        className
      )}
      onClick={onClick}
    >
      <Mail className="h-4 w-4" />
      Contact
    </Link>
  );
}

