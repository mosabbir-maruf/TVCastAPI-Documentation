'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';

type NavLink = { id: string; label: string };

interface MobileOnThisPageNavProps {
  links: NavLink[];
}

export const MobileOnThisPageNav = ({ links }: MobileOnThisPageNavProps) => {
  const sectionIds = useMemo(() => links.map((link) => link.id), [links]);
  const [active, setActive] = useState(sectionIds[0] ?? '');

  useEffect(() => {
    if (!sectionIds.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-40% 0px -50% 0px',
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  const scrollToId = (id: string) => {
    if (!id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    if (value !== active) {
      setActive(value);
    }
    scrollToId(value);
  };

  if (!links.length) {
    return null;
  }

  return (
    <div className="lg:hidden">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        On this page
      </label>
      <div className="mt-3 rounded-2xl border bg-background/80 px-4 py-3 shadow-sm shadow-black/5">
        <select
          value={active}
          onChange={handleChange}
          className="w-full bg-transparent text-sm font-medium text-foreground focus:outline-none"
        >
          <option value="">Return to top</option>
          {links.map((link) => (
            <option key={link.id} value={link.id}>
              {link.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};


