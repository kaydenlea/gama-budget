"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SiteContainer } from "@gama/ui-web";
import gamaLogo from "../../app/icon.png";

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const shellRef = useRef<HTMLDivElement | null>(null);
  const highlightTimerRef = useRef<number | null>(null);

  const handleJoinEarlyAccessClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("hero-waitlist-cta");
    const emailShell = target?.querySelector<HTMLElement>(".hero-email-shell");

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
    window.history.replaceState(null, "", "#hero-waitlist-cta");

    if (emailShell) {
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }

      const triggerHighlight = () => {
        emailShell.classList.remove("hero-email-shell-flash");
        void emailShell.offsetWidth;
        emailShell.classList.add("hero-email-shell-flash");
      };

      triggerHighlight();

      highlightTimerRef.current = window.setTimeout(() => {
        triggerHighlight();
      }, 280);

      window.setTimeout(() => {
        emailShell.classList.remove("hero-email-shell-flash");
      }, 1800);
    }
  };

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 18);

      const shellRect = shellRef.current?.getBoundingClientRect();
      const darkSections = document.querySelectorAll<HTMLElement>("[data-nav-theme='dark']");
      let nextTheme: "light" | "dark" = "light";

      if (shellRect) {
        const navTop = shellRect.top + 8;
        const navBottom = shellRect.bottom - 8;

        for (const section of darkSections) {
          const rect = section.getBoundingClientRect();
          const overlapTop = Math.max(navTop, rect.top);
          const overlapBottom = Math.min(navBottom, rect.bottom);

          if (overlapBottom > overlapTop) {
            nextTheme = "dark";
            break;
          }
        }
      }

      setTheme((current) => (current === nextTheme ? current : nextTheme));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className="floating-nav-wrap">
      <SiteContainer>
        <div
          ref={shellRef}
          className={joinClasses(
            "floating-nav-shell",
            theme === "dark" && "floating-nav-shell-dark",
            !isScrolled && "floating-nav-shell-top",
            isScrolled && "floating-nav-shell-scrolled"
          )}
        >
          <Link aria-label="Gama home" className="floating-brand" href="/">
            <Image
              alt="Gama logo"
              className="floating-brand-mark"
              height={40}
              priority
              src={gamaLogo}
              width={40}
            />
            <div className="floating-brand-copy">
              <div className="floating-brand-name">Gama</div>
            </div>
          </Link>
          <Link
            className="floating-nav-cta floating-nav-cta-inline"
            href="/#hero-waitlist-cta"
            onClick={handleJoinEarlyAccessClick}
          >
            <span className="floating-nav-cta-label-full">Join early access</span>
            <span className="floating-nav-cta-label-compact">Join</span>
            <span aria-hidden="true" className="floating-nav-cta-arrow">→</span>
          </Link>
        </div>
      </SiteContainer>
    </header>
  );
}
