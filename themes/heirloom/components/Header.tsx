"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export interface NavItem {
  label: string;
  id: string;
}

// Fixed header with a scroll-spy that highlights the section in view, and a
// full-screen menu on mobile. Sections live on one page, so navigation is a
// smooth scroll to the section's id.
export default function Header({ items, logoUrl, logoAlt }: { items: NavItem[]; logoUrl?: string; logoAlt: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const observers = items.flatMap(({ id }) => {
      const element = document.getElementById(id);
      if (!element) return [];
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        // Fires when a section reaches the top third of the viewport.
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
      );
      observer.observe(element);
      return [observer];
    });
    return () => observers.forEach((observer) => observer.disconnect());
  }, [items]);

  const goTo = (id: string) => {
    setIsMenuOpen(false);
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const linkClass = (id: string) =>
    `font-sans uppercase tracking-widest transition-all duration-200 border-b ${
      activeSection === id ? "text-gold border-gold" : "text-ink border-transparent"
    }`;

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full border-b border-gold/20 bg-silk/88 backdrop-blur-[8px]">
        <div className="container mx-auto flex items-center justify-between px-6">
          {logoUrl ? (
            <Image src={logoUrl} alt={logoAlt} width={70} height={70} sizes="(max-width: 768px) 64px, 80px" className="rounded-lg" />
          ) : (
            <span className="py-5 font-script text-3xl text-ink">{logoAlt}</span>
          )}

          <nav className="hidden items-center gap-10 md:flex" aria-label="Main">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(item.id)}
                className={`${linkClass(item.id)} pb-1 text-xs`}
                aria-current={activeSection === item.id ? "true" : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="p-2 transition-colors duration-200 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <CloseIcon />
            ) : (
              <span className="flex flex-col gap-1.5" aria-hidden="true">
                <span className="h-[1.5px] w-6 bg-gold" />
                <span className="h-[1.5px] w-6 bg-gold" />
                <span className="h-[1.5px] w-6 bg-gold" />
              </span>
            )}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-silk/98 backdrop-blur-[12px] md:hidden">
          <div className="flex justify-end px-6 pt-6">
            <button type="button" onClick={() => setIsMenuOpen(false)} aria-label="Close menu" className="text-ink">
              <CloseIcon size={24} />
            </button>
          </div>
          <nav className="flex flex-1 flex-col items-center justify-center gap-10" aria-label="Mobile">
            <div className="h-px w-10 bg-gold" aria-hidden="true" />
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(item.id)}
                className={`${linkClass(item.id)} pb-0.5 text-sm ${activeSection === item.id ? "font-semibold" : "font-normal"}`}
              >
                {item.label}
              </button>
            ))}
            <div className="h-px w-10 bg-gold" aria-hidden="true" />
          </nav>
        </div>
      )}
    </>
  );
}

function CloseIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
