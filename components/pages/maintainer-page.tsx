'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type FormEvent, type MouseEvent } from 'react';
import {
  Code2,
  Mail,
  Github,
  MapPin,
  Globe,
  Shield,
  Zap,
  BookOpen,
  Target,
  Clock,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { Pattern } from '@/components/ui/pattern';
import { OnThisPageNav } from '@/components/privacy/on-this-page-nav';
import { siteConfig } from '@/config/site';
import { MobileDrawer } from '@/components/ui/mobile-drawer';
import { MobileHeader } from '@/components/ui/mobile-header';
import { SupportButton } from '@/components/ui/support-button';

const maintainerProfile = {
  name: 'Mosabbir Maruf',
  role: 'Creator & Maintainer',
  summary:
    'Building and maintaining the TVCastAPI service with a focus on reliability, scraping accuracy, and delightful developer tooling.',
  location: 'Dhaka, Bangladesh',
  timezone: 'GMT+6 (Asia/Dhaka)',
  email: 'hellomosabbir@outlook.com',
  availability: 'Replies within 24 hours on business days',
  languages: ['English', 'Bangla', 'Hindi'],
  experience: '2+ years working with Node.js, scraping, and streaming stacks',
};

const responsibilities = [
  {
    title: 'API Stability',
    description: 'Monitors upstream changes and ships hotfixes when the source site updates markup or endpoints.',
    icon: Shield,
  },
  {
    title: 'Feature Roadmap',
    description: 'Plans enhancements for new endpoints, streaming improvements, and developer experience upgrades.',
    icon: Target,
  },
  {
    title: 'Community Support',
    description: 'Provides guidance for integrators via GitHub issues and direct contact for integration help.',
    icon: BookOpen,
  },
  {
    title: 'Performance & Scaling',
    description: 'Optimizes scraping routines, caching strategy, and Redis integration for faster responses.',
    icon: Zap,
  },
];

const contactMethods = [
  {
    label: 'Email',
    value: maintainerProfile.email,
    href: `mailto:${maintainerProfile.email}`,
    description: 'Perfect for access requests, longer questions, or sharing roadmaps.',
    icon: Mail,
  },
  {
    label: 'GitHub',
    value: '@mosabbir-maruf',
    href: 'https://github.com/mosabbir-maruf',
    description: 'View profile, repositories, and contributions.',
    icon: Github,
  },
];

const leftNavGroups = [
  {
    heading: null,
    links: [
      { label: 'Documentation', href: '/' },
      { label: 'API Testing', href: '/testing' },
      { label: 'Maintainer', href: '/maintainer', current: true },
      { label: 'GitHub Repository', href: siteConfig.github, external: true },
    ],
  },
  {
    heading: 'Quick Links',
    links: [
      { label: 'Installation', href: '/#installation' },
      { label: 'Environment Variables', href: '/#environment-variables' },
      { label: 'Backend', href: '/#backend-env', subItem: true },
      { label: 'Frontend', href: '/#frontend-env', subItem: true },
      { label: 'API Endpoints', href: '/#home' },
    ],
  },
];

const navLinks = [
  { id: 'profile', label: 'Profile' },
  { id: 'responsibilities', label: 'Responsibilities' },
  { id: 'profile-snapshot', label: 'Profile Snapshot' },
  { id: 'contact', label: 'Contact' },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const supportFormDefaults = {
  name: '',
  email: '',
  company: '',
  subject: '',
  message: '',
};

export default function MaintainerPage() {
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [envVarsExpanded, setEnvVarsExpanded] = useState(false);
  type SupportField = keyof typeof supportFormDefaults;

  const [supportForm, setSupportForm] = useState({ ...supportFormDefaults });
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [supportFeedback, setSupportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [supportErrors, setSupportErrors] = useState<Partial<Record<SupportField, string>>>({});

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  type NavLink = (typeof leftNavGroups)[number]['links'][number] & {
    samePage?: boolean;
  };

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    link: NavLink,
    options?: { closeDrawer?: () => void }
  ) => {
    if ('samePage' in link && link.samePage && link.href.startsWith('#')) {
      event.preventDefault();
      scrollToSection(link.href.replace('#', ''));
      options?.closeDrawer?.();
    }
  };

  const clearSupportError = (field: SupportField) => {
    setSupportErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSupportFieldChange = (field: SupportField, value: string) => {
    setSupportForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    clearSupportError(field);
  };

  const validateSupportForm = () => {
    const trimmed = {
      name: supportForm.name.trim(),
      email: supportForm.email.trim(),
      subject: supportForm.subject.trim(),
      message: supportForm.message.trim(),
    };

    const errors: Partial<Record<SupportField, string>> = {};

    if (!trimmed.name) {
      errors.name = 'Please share your full name.';
    }

    if (!trimmed.email) {
      errors.email = 'Email address is required.';
    } else if (!emailPattern.test(trimmed.email)) {
      errors.email = 'Enter a valid email (e.g. you@example.com).';
    }

    if (!trimmed.subject) {
      errors.subject = 'Subject can’t be empty.';
    }

    if (!trimmed.message || trimmed.message.length < 20) {
      errors.message = 'Message should be at least 20 characters.';
    }

    setSupportErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const inputClasses = (field: SupportField) =>
    `w-full rounded-xl border bg-card/60 px-3 py-2 text-sm sm:text-base outline-none ring-offset-background transition focus:ring-2 ${
      supportErrors[field] ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200/80' : 'focus:border-primary focus:ring-primary/40'
    }`;

  const textareaClasses = (field: SupportField) =>
    `w-full rounded-2xl border bg-card/60 px-3 py-3 text-sm sm:text-base outline-none ring-offset-background transition focus:ring-2 ${
      supportErrors[field] ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200/80' : 'focus:border-primary focus:ring-primary/40'
    }`;

  const handleSupportSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSupportFeedback(null);

    if (!validateSupportForm()) {
      return;
    }

    setIsSubmittingSupport(true);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supportForm),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error ?? 'Unable to send your message right now. Please try again later.');
      }

      setSupportFeedback({
        type: 'success',
        message: result?.message ?? 'Thanks! Your message has been delivered successfully.',
      });
      setSupportForm({ ...supportFormDefaults });
    } catch (error) {
      console.error('Support form submission failed', error);
      setSupportFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Something went wrong while sending your message. Please try again later.',
      });
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  return (
    <div className="relative isolate bg-background">
      {/* Mobile Header */}
      <MobileHeader
        onLeftMenuClick={() => setLeftDrawerOpen(true)}
        onRightMenuClick={() => setRightDrawerOpen(true)}
      />

      {/* Left Drawer - Navigation */}
      <MobileDrawer
        isOpen={leftDrawerOpen}
        onClose={() => setLeftDrawerOpen(false)}
        position="left"
      >
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-3" onClick={() => setLeftDrawerOpen(false)}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-card">
              <Code2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold">{siteConfig.name}</p>
              <p className="text-muted-foreground text-xs">Maintainer</p>
            </div>
          </Link>
          <nav className="space-y-5 text-sm">
            {leftNavGroups.map((group, index) => (
              <div
                key={group.heading ?? `group-${index}`}
                className={`space-y-2 ${index !== 0 ? 'border-t border-border pt-5' : ''}`}
              >
                {group.heading && (
                  <p className="font-semibold text-xs uppercase tracking-wide">{group.heading}</p>
                )}
                <div className="flex flex-col gap-0.5 text-muted-foreground">
                  {group.links.map((link) => {
                    if (link.label === 'Environment Variables') {
                      return (
                        <div key={link.label} className="flex flex-col gap-0.5">
                          <button
                            onClick={() => setEnvVarsExpanded(!envVarsExpanded)}
                            className="w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            {link.label}
                          </button>
                          {envVarsExpanded && (
                            <>
                              {group.links
                                .filter((l) => 'subItem' in l && l.subItem)
                                .map((subLink) => (
                                  <Link
                                    key={subLink.label}
                                    href={subLink.href}
                                    className="ml-6 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground border-l-2 border-border/50 pl-3"
                                    onClick={(event) => {
                                      handleNavClick(event, subLink, { closeDrawer: () => setLeftDrawerOpen(false) });
                                      if (!('samePage' in subLink && subLink.samePage)) {
                                        setLeftDrawerOpen(false);
                                      }
                                    }}
                                  >
                                    {subLink.label}
                                  </Link>
                                ))}
                            </>
                          )}
                        </div>
                      );
                    }
                    if ('subItem' in link && link.subItem) {
                      return null; // Sub-items are rendered under Environment Variables
                    }
                    return (
                      <Link
                        key={link.label}
                        href={link.href}
                        className={`rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                          'current' in link && link.current ? 'text-primary font-semibold' : ''
                        }`}
                        target={'external' in link && link.external ? '_blank' : undefined}
                        rel={'external' in link && link.external ? 'noreferrer' : undefined}
                        onClick={(event) => {
                          handleNavClick(event, link, { closeDrawer: () => setLeftDrawerOpen(false) });
                          if (!('samePage' in link && link.samePage)) {
                            setLeftDrawerOpen(false);
                          }
                        }}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <SupportButton
            onClick={(event) => {
              event.preventDefault();
              scrollToSection('contact');
              setLeftDrawerOpen(false);
            }}
          />
        </div>
      </MobileDrawer>

      {/* Right Drawer - On This Page */}
      <MobileDrawer
        isOpen={rightDrawerOpen}
        onClose={() => setRightDrawerOpen(false)}
        position="right"
      >
        <OnThisPageNav links={navLinks} />
      </MobileDrawer>

    <div className="relative isolate bg-background">
      <Pattern variant="dots" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-70">
        <div className="absolute left-1/2 top-[-10%] h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-80 w-80 translate-x-1/3 rounded-full bg-[#8b5cf6]/20 blur-[150px]" />
        <div className="absolute bottom-[-15%] left-0 h-64 w-64 -translate-x-1/3 rounded-full bg-emerald-400/15 blur-[120px]" />
      </div>

      <section className="mx-auto flex w-full max-w-[1600px] items-start gap-4 px-4 py-8 sm:py-12 md:py-16 lg:px-0">
        {/* Left Sidebar */}
        <aside className="sticky top-24 hidden w-64 shrink-0 self-start lg:block">
          <div className="max-h-[calc(100vh-96px)] space-y-6 overflow-y-auto rounded-2xl border bg-background/70 p-6 shadow-xl shadow-black/5 backdrop-blur">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-card">
                <Code2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold">{siteConfig.name}</p>
                <p className="text-muted-foreground text-xs">Maintainer</p>
              </div>
            </Link>
            <nav className="space-y-5 text-sm">
              {leftNavGroups.map((group, index) => (
                <div
                  key={group.heading ?? `group-${index}`}
                  className={`space-y-2 ${index !== 0 ? 'border-t border-border pt-5' : ''}`}
                >
                  {group.heading && (
                    <p className="font-semibold text-xs uppercase tracking-wide">{group.heading}</p>
                  )}
                  <div className="flex flex-col gap-0.5 text-muted-foreground">
                    {group.links.map((link) => {
                      if (link.label === 'Environment Variables') {
                        return (
                          <div key={link.label}>
                            <button
                              onClick={() => setEnvVarsExpanded(!envVarsExpanded)}
                              className="w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              {link.label}
                            </button>
                            {envVarsExpanded && (
                              <>
                                {group.links
                                  .filter((l) => 'subItem' in l && l.subItem)
                                  .map((subLink) => (
                                    <Link
                                      key={subLink.label}
                                      href={subLink.href}
                                      className="ml-6 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground border-l-2 border-border/50 pl-3"
                                      onClick={(event) => handleNavClick(event, subLink)}
                                    >
                                      {subLink.label}
                                    </Link>
                                  ))}
                              </>
                            )}
                          </div>
                        );
                      }
                      if ('subItem' in link && link.subItem) {
                        return null; // Sub-items are rendered under Environment Variables
                      }
                      return (
                      <Link
                        key={link.label}
                        href={link.href}
                          className={`rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                          'current' in link && link.current ? 'text-primary font-semibold' : ''
                        }`}
                        target={'external' in link && link.external ? '_blank' : undefined}
                        rel={'external' in link && link.external ? 'noreferrer' : undefined}
                        onClick={(event) => handleNavClick(event, link)}
                      >
                        {link.label}
                      </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <SupportButton
              onClick={(event) => {
                event.preventDefault();
                scrollToSection('contact');
              }}
            />
          </div>
        </aside>

        {/* Main Content */}
        <article className="flex-1 space-y-8 sm:space-y-10 md:space-y-12">
          <section id="profile" className="rounded-2xl sm:rounded-3xl border bg-background/70 p-4 sm:p-6 md:p-8 shadow-lg shadow-black/5 backdrop-blur">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="relative h-16 w-16 sm:h-24 sm:w-24 overflow-hidden rounded-2xl border-2 border-primary/20 bg-card shadow-inner">
                <Image
                  src="/profile.jpeg"
                  alt={`${maintainerProfile.name} portrait`}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  priority
                  unoptimized
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-primary">Creator & Maintainer</p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">{maintainerProfile.name}</h1>
              </div>
            </div>
            <p className="mt-4 sm:mt-6 text-muted-foreground text-sm sm:text-base">{maintainerProfile.summary}</p>

            <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl sm:rounded-2xl border bg-card/60 p-3 sm:p-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  Location
                </div>
                <p className="mt-2 text-foreground text-sm sm:text-base">{maintainerProfile.location}</p>
              </div>
              <div className="rounded-xl sm:rounded-2xl border bg-card/60 p-3 sm:p-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  Timezone
                </div>
                <p className="mt-2 text-foreground text-sm sm:text-base">{maintainerProfile.timezone}</p>
              </div>
              <div className="rounded-xl sm:rounded-2xl border bg-card/60 p-3 sm:p-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  Languages
                </div>
                <p className="mt-2 text-foreground text-sm sm:text-base">{maintainerProfile.languages.join(', ')}</p>
              </div>
              <div className="rounded-xl sm:rounded-2xl border bg-card/60 p-3 sm:p-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  Availability
                </div>
                <p className="mt-2 text-foreground text-sm sm:text-base">{maintainerProfile.availability}</p>
              </div>
            </div>
          </section>


          <section
            id="responsibilities"
            className="rounded-2xl sm:rounded-3xl border bg-background/70 p-4 sm:p-6 md:p-8 shadow-lg shadow-black/5 backdrop-blur scroll-mt-24 sm:scroll-mt-36"
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Responsibilities</h2>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {responsibilities.map((item) => (
                <div key={item.title} className="rounded-xl sm:rounded-2xl border bg-card/50 p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    <h3 className="text-base sm:text-lg font-semibold">{item.title}</h3>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section
            id="profile-snapshot"
            className="rounded-2xl sm:rounded-3xl border bg-background/70 p-4 sm:p-6 md:p-8 shadow-lg shadow-black/5 backdrop-blur scroll-mt-24 sm:scroll-mt-36"
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Profile Snapshot</h2>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Experience:</span> {maintainerProfile.experience}
              </p>
              <p>
                <span className="font-semibold text-foreground">Focus Areas:</span> Scraping accuracy, TV channel streaming
                resilience, documentation, developer tooling.
              </p>
              <p>
                <span className="font-semibold text-foreground">Availability:</span> {maintainerProfile.availability}
              </p>
            </div>
          </section>

          <section
            id="contact"
            className="rounded-2xl sm:rounded-3xl border bg-background/70 p-4 sm:p-6 md:p-8 shadow-lg shadow-black/5 backdrop-blur scroll-mt-24 sm:scroll-mt-36"
          >
            <div className="space-y-5 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold leading-tight">Let’s talk about your ideas</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Use the form or channels below—everything routes to the same inbox so I can reply quickly.
                </p>
              </div>

              <div className="rounded-2xl border bg-card/50 p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-lg sm:text-xl font-semibold">Send a message</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Fill out the form below and I’ll follow up directly, typically within a business day.
                  </p>
                </div>

                <form onSubmit={handleSupportSubmit} noValidate className="mt-6 space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="support-name"
                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        Full Name
                      </label>
                      <input
                        id="support-name"
                        name="name"
                        type="text"
                        required
                        value={supportForm.name}
                        onChange={(event) => handleSupportFieldChange('name', event.target.value)}
                        placeholder="Your name"
                        className={inputClasses('name')}
                        aria-invalid={Boolean(supportErrors.name)}
                        aria-describedby={supportErrors.name ? 'support-name-error' : undefined}
                      />
                      {supportErrors.name && (
                        <p id="support-name-error" className="text-xs font-medium text-rose-500">
                          {supportErrors.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="support-email"
                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        Email
                      </label>
                      <input
                        id="support-email"
                        name="email"
                        type="email"
                        required
                        value={supportForm.email}
                        onChange={(event) => handleSupportFieldChange('email', event.target.value)}
                        placeholder="you@example.com"
                        className={inputClasses('email')}
                        aria-invalid={Boolean(supportErrors.email)}
                        aria-describedby={supportErrors.email ? 'support-email-error' : undefined}
                      />
                      {supportErrors.email && (
                        <p id="support-email-error" className="text-xs font-medium text-rose-500">
                          {supportErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="support-company"
                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        Company or Project
                      </label>
                      <input
                        id="support-company"
                        name="company"
                        type="text"
                        value={supportForm.company}
                        onChange={(event) => handleSupportFieldChange('company', event.target.value)}
                        placeholder="Optional"
                        className="w-full rounded-xl border bg-card/60 px-3 py-2 text-sm sm:text-base outline-none ring-offset-background transition focus:border-primary focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="support-subject"
                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        Subject
                      </label>
                      <input
                        id="support-subject"
                        name="subject"
                        type="text"
                        required
                        value={supportForm.subject}
                        onChange={(event) => handleSupportFieldChange('subject', event.target.value)}
                        placeholder="Access, integration, roadmap..."
                        className={inputClasses('subject')}
                        aria-invalid={Boolean(supportErrors.subject)}
                        aria-describedby={supportErrors.subject ? 'support-subject-error' : undefined}
                      />
                      {supportErrors.subject && (
                        <p id="support-subject-error" className="text-xs font-medium text-rose-500">
                          {supportErrors.subject}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="support-message" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Message
                    </label>
                    <textarea
                      id="support-message"
                      name="message"
                      required
                      minLength={20}
                      value={supportForm.message}
                      onChange={(event) => handleSupportFieldChange('message', event.target.value)}
                      placeholder="Let me know how I can help..."
                      className={textareaClasses('message')}
                      aria-invalid={Boolean(supportErrors.message)}
                      aria-describedby={supportErrors.message ? 'support-message-error' : undefined}
                      rows={5}
                    />
                    {supportErrors.message && (
                      <p id="support-message-error" className="text-xs font-medium text-rose-500">
                        {supportErrors.message}
                      </p>
                    )}
                  </div>

                  {supportFeedback && (
                    <div
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        supportFeedback.type === 'success'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                          : 'border-rose-200 bg-rose-50 text-rose-900'
                      }`}
                    >
                      {supportFeedback.message}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <button
                      type="submit"
                      disabled={isSubmittingSupport}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2 text-sm sm:text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmittingSupport ? 'Sending...' : 'Send'}
                    </button>
                    <p className="text-xs sm:text-sm text-muted-foreground">I’ll reply directly to the email you provide.</p>
                  </div>
                </form>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {contactMethods.map((method) => (
                  <Link
                    key={method.label}
                    href={method.href}
                    target={method.href.startsWith('http') ? '_blank' : undefined}
                    rel={method.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="flex items-start gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border bg-card/60 p-3 sm:p-4 transition hover:border-primary"
                  >
                    <div className="rounded-lg sm:rounded-xl border bg-background p-1.5 sm:p-2">
                      <method.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground">{method.label}</p>
                      <p className="text-sm sm:text-base text-primary break-all">{method.value}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{method.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

        </article>

        {/* Right Sidebar */}
        <aside className="sticky top-24 hidden w-64 shrink-0 self-start xl:block">
          <div className="max-h-[calc(100vh-96px)] space-y-4 overflow-y-auto rounded-2xl border bg-background/70 p-6 shadow-xl shadow-black/5 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">On this page</p>
            <OnThisPageNav links={navLinks} />
          </div>
        </aside>
      </section>
    </div>
    </div>
  );
}
