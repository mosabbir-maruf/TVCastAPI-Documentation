'use client';

import { Menu, List } from 'lucide-react';
import { Code2 } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

interface MobileHeaderProps {
  onLeftMenuClick: () => void;
  onRightMenuClick: () => void;
  showRightMenu?: boolean;
}

export function MobileHeader({ onLeftMenuClick, onRightMenuClick, showRightMenu = true }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 lg:hidden bg-background/95 backdrop-blur border-b">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Menu Button */}
        <button
          onClick={onLeftMenuClick}
          className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-card">
            <Code2 className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold">{siteConfig.name}</span>
        </Link>

        {/* Right Menu Button */}
        {showRightMenu ? (
          <button
            onClick={onRightMenuClick}
            className="flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted transition-colors"
            aria-label="Open table of contents"
          >
            <List className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-10" /> // Placeholder for alignment
        )}
      </div>
    </header>
  );
}

