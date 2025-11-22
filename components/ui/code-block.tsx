'use client';

import { CopyButton } from './copy-button';

interface CodeBlockProps {
  code: string;
  className?: string;
  maxHeight?: string;
}

export function CodeBlock({ code, className = '', maxHeight }: CodeBlockProps) {
  return (
    <div className="relative">
      <pre
        className={`rounded-lg bg-muted p-4 pr-12 sm:pr-12 text-sm overflow-x-auto ${maxHeight || ''} ${className}`}
      >
        <code>{code}</code>
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

