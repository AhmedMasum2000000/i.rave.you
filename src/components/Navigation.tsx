import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, Calendar, ChevronRight } from 'lucide-react';
import { ArtistLogo } from './ArtistLogo';

const navigationItems = [
  { id: 'music', label: 'Music', mobileLabel: 'Music & Discography' },
  { id: 'philosophy', label: 'Philosophy', mobileLabel: 'Artist & Philosophy' },
  { id: 'live', label: 'Live & DJ', mobileLabel: 'Live Performances & DJ Sets' },
  { id: 'press', label: 'EPK / Press', mobileLabel: 'Electronic Press Kit' },
  { id: 'booking', label: 'Booking', mobileLabel: 'Booking & Inquiries' },
] as const;

type SectionId = (typeof navigationItems)[number]['id'];

export const Navigation: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId | 'top'>('top');
  const progressRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let animationFrame = 0;

    const updatePosition = () => {
      animationFrame = 0;
      let currentSection: SectionId | 'top' = 'top';

      for (const item of navigationItems) {
        const section = document.getElementById(item.id);
        if (section && section.getBoundingClientRect().top <= 128) {
          currentSection = item.id;
        }
      }

      setActiveSection((previous) =>
        previous === currentSection ? previous : currentSection,
      );

      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollableHeight > 0
          ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
          : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    const scheduleUpdate = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updatePosition);
      }
    };

    updatePosition();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="glass-nav fixed left-0 right-0 top-0 z-40 w-full transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          onClick={closeMobileMenu}
          className="group flex shrink-0 items-center gap-3 whitespace-nowrap rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          aria-label="অপূর্ব Home"
        >
          <ArtistLogo variant="full" size="sm" showSubtitle={false} />
        </a>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-4 text-xs font-medium text-zinc-400 lg:flex xl:gap-7 xl:text-sm"
        >
          {navigationItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={activeSection === item.id ? 'location' : undefined}
              className="site-nav-link whitespace-nowrap py-2 transition-colors focus-visible:text-indigo-300"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href="#booking"
            onClick={closeMobileMenu}
            className="hidden items-center gap-1.5 whitespace-nowrap rounded-xl bg-zinc-950 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-black/20 transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 sm:flex sm:px-4"
          >
            <Calendar className="h-3.5 w-3.5 text-indigo-400" />
            <span>Book Performance</span>
          </a>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-site-navigation"
            className="glass-pill rounded-xl p-2 text-zinc-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 lg:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="glass-nav-progress absolute inset-x-0 bottom-0 h-px scale-x-0"
        ref={progressRef}
      />

      <div
        id="mobile-site-navigation"
        hidden={!mobileMenuOpen}
        className="mobile-nav-panel max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 px-4 pb-6 pt-4 shadow-2xl lg:hidden"
      >
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 px-3 text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500">
            Explore the site
          </p>
          <nav aria-label="Mobile navigation" className="grid gap-1 sm:grid-cols-2">
            {navigationItems.map((item, index) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={closeMobileMenu}
                aria-current={activeSection === item.id ? 'location' : undefined}
                className="mobile-nav-link group flex min-h-14 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <span className="font-mono text-[10px] text-indigo-300/80">
                  0{index + 1}
                </span>
                <span className="flex-1">{item.mobileLabel}</span>
                <ChevronRight className="h-4 w-4 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-indigo-300" />
              </a>
            ))}
          </nav>
          <p className="mt-4 border-t border-white/10 px-3 pt-4 text-xs text-zinc-500">
            Current section:{' '}
            <span className="font-medium text-indigo-200">
              {navigationItems.find((item) => item.id === activeSection)?.label ?? 'Home'}
            </span>
          </p>
        </div>
      </div>
    </header>
  );
};
