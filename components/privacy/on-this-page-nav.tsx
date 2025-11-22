'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';

type NavLink = { 
  id: string; 
  label: string; 
  isSubItem?: boolean; 
  parentId?: string;
  hasSubItems?: boolean;
};

interface OnThisPageNavProps {
  links: NavLink[];
}

export const OnThisPageNav = ({ links }: OnThisPageNavProps) => {
  const sectionIds = useMemo(() => links.map((link) => link.id), [links]);
  const [active, setActive] = useState(sectionIds[0] ?? '');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Auto-collapse when navigating away from Environment Variables section
  useEffect(() => {
    const activeLink = links.find(l => l.id === active);
    const isEnvironmentSection = active === 'environment-variables' || 
                                 active === 'backend-env' || 
                                 active === 'frontend-env' ||
                                 activeLink?.parentId === 'environment-variables';
    
    if (!isEnvironmentSection) {
      // Collapse Environment Variables section when navigating to other sections
      setExpandedSections(prev => {
        const newSet = new Set(prev);
        newSet.delete('environment-variables');
        return newSet;
      });
    }
  }, [active, links]);

  useEffect(() => {
    if (!sectionIds.length) {
      return;
    }

    const lastSectionId = sectionIds[sectionIds.length - 1];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActive(id);
            // Auto-expand parent section when a sub-item becomes active
            const link = links.find(l => l.id === id);
            if (link?.parentId) {
              setExpandedSections(prev => new Set(prev).add(link.parentId!));
            }
            // Auto-expand section when it becomes active and has sub-items
            const parentLink = links.find(l => l.id === id && l.hasSubItems);
            if (parentLink) {
              setExpandedSections(prev => new Set(prev).add(id));
            }
          }
        });
      },
      {
        rootMargin: '-40% 0px -50% 0px',
        threshold: 0,
      },
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    const handleScroll = () => {
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
      if (scrolledToBottom && lastSectionId) {
        setActive(lastSectionId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sectionIds, links]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const link = links.find(l => l.id === id);
    
    // Toggle expansion if clicking on a section with sub-items
    if (link?.hasSubItems) {
      setExpandedSections(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    }
    
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative pl-6">
      <div className="absolute left-3 top-0 h-full w-px rounded-full bg-border" />
      <nav className="flex flex-col gap-1 text-sm">
        {links.map((link) => {
          const isActive = active === link.id;
          const isSubItem = link.isSubItem || false;
          const hasSubItems = link.hasSubItems || false;
          
          // Hide sub-items if parent is not expanded
          if (isSubItem && link.parentId) {
            if (!expandedSections.has(link.parentId)) {
              return null;
            }
          }
          
          return (
            <div key={link.id} className={`relative ${isSubItem ? 'ml-4 border-l-2 border-border/50 pl-3' : ''}`}>
              {isActive && (
                <span className={`absolute -left-4 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary ${isSubItem ? '-left-6' : ''}`} />
              )}
              <a
                href={`#${link.id}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={(event) => handleClick(event, link.id)}
                className={`block rounded-md px-2 py-1 transition-colors ${
                  isActive ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'
                } ${isSubItem ? 'text-xs' : ''} ${hasSubItems ? 'cursor-pointer' : ''}`}
              >
                {link.label}
              </a>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

