// Built using Hyperiux Vault: https://vault.hyperiux.com
// Integrated into LinkOS with a small controlled-mode extension (`open`,
// `onRequestClose`, `hideHeader`) so host pages can trigger the overlay from
// their own navbar while keeping the original uncontrolled API intact.
"use client";

import gsap from "gsap";
import type { MouseEvent, ReactNode } from "react";
import { useEffect, useRef, useState, type RefObject } from "react";

/* ------------------------------------------------------------------ *
 * Inlined from ./useFocusTrap — keeps keyboard focus inside a container
 * while it's open, restores it to the trigger on close.
 * ------------------------------------------------------------------ */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const isVisible = (element?: HTMLElement | null): boolean => {
  if (!element || element.hidden) return false;
  const style = window.getComputedStyle(element);
  if (style.visibility === "hidden" || style.visibility === "collapse") return false;
  return element.getClientRects().length > 0;
};

const getFocusableElements = (container?: HTMLElement | null): HTMLElement[] => {
  if (!container) return [];
  return (Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[]).filter(isVisible);
};

interface UseFocusTrapParams {
  active: boolean;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  onEscape?: () => void;
}

/**
 * Keeps keyboard focus inside `containerRef` while `active` is true.
 *
 * - Captures the element focused before opening and restores focus to it on
 *   close (so the trigger button gets focus back).
 * - Moves focus into the menu on open (to `initialFocusRef` when provided,
 *   otherwise the first focusable element).
 * - Wraps Tab / Shift+Tab around the menu's focusable elements.
 * - Calls `onEscape` when the Escape key is pressed.
 */
function useFocusTrap({ active, containerRef, initialFocusRef, onEscape }: UseFocusTrapParams) {
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusInitial = () => {
      const target = initialFocusRef?.current ?? getFocusableElements(container)[0] ?? container;
      if (!(target instanceof HTMLElement)) return;
      if (target === container && !container.hasAttribute("tabindex")) {
        container.setAttribute("tabindex", "-1");
      }
      target.focus();
    };

    // Defer focus so it lands after the menu has mounted / started animating in.
    const focusFrame = requestAnimationFrame(focusInitial);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscapeRef.current?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(container);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === first || !container.contains(activeElement)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (activeElement === last || !container.contains(activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [active, containerRef, initialFocusRef]);
}

/* ------------------------------------------------------------------ *
 * FullscreenNav — the clip-path reveal shell: fixed header (brand + toggle)
 * and a fixed full-screen panel that wipes open from `clipOrigin`. Accepts
 * either a static `links` list or a `children(isOpen)` render prop for a
 * fully custom panel layout (CustomNavbar below uses this).
 * ------------------------------------------------------------------ */

const CLIPS = {
  bottom: {
    closedInitial: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
    open: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    closedFinal: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
  },
  top: {
    closedInitial: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
    open: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    closedFinal: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
  },
  left: {
    closedInitial: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
    open: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    closedFinal: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
  },
  right: {
    closedInitial: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
    open: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    closedFinal: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
  },
};

const REDUCED_MOTION_FADE_DURATION = 0.2;

export interface FullscreenNavLink {
  label: string;
  href: string;
}

export interface FullscreenNavProps {
  links?: FullscreenNavLink[];
  /** Brand text shown in the fixed header, linking to `brandHref`. */
  brand?: string;
  brandHref?: string;
  clipOrigin?: keyof typeof CLIPS;
  overlayBg?: string;
  linkColor?: string;
  linkHoverColor?: string;
  linkSizeClass?: string;
  headerClassName?: string;
  openDuration?: number;
  closeDuration?: number;
  ease?: string;
  /** Header text/hamburger-bar color while the overlay is open. Closed color is fixed black, matching the header's light-page default. */
  headerOpenColor?: string;
  onOpen?: () => void;
  onClose?: () => void;
  children?: (isOpen: boolean) => ReactNode;
  /**
   * Controlled open state. When provided, the parent drives opening/closing
   * (e.g. from its own navbar button) and the built-in header can be hidden
   * with `hideHeader`.
   */
  open?: boolean;
  /** Called when the overlay asks to close (Escape key, link click) in controlled mode. */
  onRequestClose?: () => void;
  /** Hide the built-in fixed header — for controlled mode when the host page renders its own header. */
  hideHeader?: boolean;
}

export function FullscreenNav({
  links,
  brand = "Hyperiux",
  brandHref = "/",
  clipOrigin = "bottom",
  overlayBg = "#000000",
  linkColor = "#ffffff",
  linkHoverColor = "#a3a3a3",
  linkSizeClass = "text-5xl",
  headerClassName = "",
  openDuration = 1.2,
  closeDuration = 1.2,
  ease = "power4.inOut",
  headerOpenColor = "#ffffff",
  onOpen,
  onClose,
  children,
  open: controlledOpen,
  onRequestClose,
  hideHeader = false,
}: FullscreenNavProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setIsOpen] = useState(false);
  const isOpen = isControlled ? !!controlledOpen : internalOpen;
  const controlledStateRef = useRef(isOpen);
  const overlayRef = useRef<HTMLElement | null>(null);
  const linksWrapperRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);
  const isAnimatingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const reduceMotion = () =>
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

  const { closedInitial, open: openClipPath, closedFinal } = CLIPS[clipOrigin] ?? CLIPS.bottom;
  const isReducedMotion = reduceMotion();

  const runOpenAnimation = () => {
    timelineRef.current?.kill();

    gsap.set(overlayRef.current, { clipPath: closedInitial });
    gsap.set(linksWrapperRef.current, { opacity: 1, scale: 1 });

    if (isReducedMotion) {
      gsap.set(overlayRef.current, { clipPath: openClipPath, autoAlpha: 0 });

      timelineRef.current = gsap.to(overlayRef.current, {
        autoAlpha: 1,
        duration: REDUCED_MOTION_FADE_DURATION,
        ease: "power2.out",
        onStart: () => {
          isAnimatingRef.current = true;
        },
        onComplete: () => {
          isAnimatingRef.current = false;
          onOpen?.();
        },
      });
      return;
    }

    const timeline = gsap.timeline({
      onStart: () => {
        isAnimatingRef.current = true;
      },
      onComplete: () => {
        isAnimatingRef.current = false;
        onOpen?.();
      },
    });

    timelineRef.current = timeline;

    timeline.to(overlayRef.current, {
      clipPath: openClipPath,
      duration: openDuration,
      delay: 0.2,
      ease,
    });
  };

  const runCloseAnimation = () => {
    timelineRef.current?.kill();

    if (isReducedMotion) {
      gsap.set(linksWrapperRef.current, { scale: 1, opacity: 1 });

      timelineRef.current = gsap.to(overlayRef.current, {
        autoAlpha: 0,
        duration: REDUCED_MOTION_FADE_DURATION,
        ease: "power2.out",
        onStart: () => {
          isAnimatingRef.current = true;
        },
        onComplete: () => {
          isAnimatingRef.current = false;
          gsap.set(overlayRef.current, { clipPath: closedFinal });
          onClose?.();
        },
      });

      gsap.set(overlayRef.current, { clipPath: closedFinal });
      return;
    }

    const timeline = gsap.timeline({
      onStart: () => {
        isAnimatingRef.current = true;
      },
      onComplete: () => {
        isAnimatingRef.current = false;
        onClose?.();
      },
    });

    timelineRef.current = timeline;

    timeline
      .to(linksWrapperRef.current, { scale: 0.9, opacity: 0.5, duration: 0.7, ease: "power2.in" })
      .to(overlayRef.current, { clipPath: closedFinal, duration: closeDuration, ease }, "<");
  };

  const onOpenMenu = () => {
    setIsOpen(true);
    runOpenAnimation();
  };

  const onCloseMenu = () => {
    setIsOpen(false);
    runCloseAnimation();
  };

  // Controlled mode: animate whenever the parent flips `open`.
  useEffect(() => {
    if (!isControlled) return;
    if (controlledStateRef.current === controlledOpen) return;
    controlledStateRef.current = !!controlledOpen;
    if (controlledOpen) {
      runOpenAnimation();
    } else {
      runCloseAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledOpen, isControlled]);

  const requestClose = () => {
    if (isControlled) {
      onRequestClose?.();
      return;
    }
    onCloseMenu();
  };

  const onToggleMenu = () => {
    if (isAnimatingRef.current) return;
    if (isOpen) {
      onCloseMenu();
      return;
    }
    onOpenMenu();
  };

  const onLinkMouseEnter = (event: MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.color = linkHoverColor;
  };

  const onLinkMouseLeave = (event: MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.color = linkColor;
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Trap focus inside the overlay while open, restore it to the toggle on close.
  useFocusTrap({ active: isOpen, containerRef: rootRef, initialFocusRef: toggleButtonRef, onEscape: requestClose });

  return (
    <div ref={rootRef}>
      {!hideHeader && (
        <header className={`fixed top-0 left-0 right-0 z-70 flex h-20 items-center justify-between px-8 ${headerClassName}`}>
          <a
            href={brandHref}
            className="cursor-pointer text-lg font-semibold uppercase tracking-[0.15em] transition-colors duration-300 delay-700 motion-reduce:transition-none"
            style={{ color: isOpen ? headerOpenColor : "#000000" }}
          >
            {brand}
          </a>

          <button
            ref={toggleButtonRef}
            onClick={onToggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            className="flex size-10 cursor-pointer flex-col items-center justify-center gap-1.5 max-[1025px]:size-14 max-md:size-10"
          >
            <span
              style={{ backgroundColor: isOpen ? headerOpenColor : undefined }}
              className={`block h-0.5 w-full transition-all duration-700 ease-in-out delay-300 motion-reduce:transition-none ${
                isOpen ? "translate-y-1.75 rotate-45" : isReducedMotion ? "translate-y-0 rotate-0 bg-black" : "bg-black"
              }`}
            />
            <span
              style={{ backgroundColor: isOpen ? headerOpenColor : undefined }}
              className={`block h-0.5 w-full transition-all duration-500 delay-300 motion-reduce:transition-none ${
                isOpen ? "scale-x-0 opacity-0" : isReducedMotion ? "scale-x-100 opacity-100 bg-black" : "bg-black"
              }`}
            />
            <span
              style={{ backgroundColor: isOpen ? headerOpenColor : undefined }}
              className={`block h-0.5 w-full transition-all duration-700 ease-in-out delay-300 motion-reduce:transition-none ${
                isOpen ? "-translate-y-2.25 -rotate-45" : isReducedMotion ? "translate-y-0 rotate-0 bg-black" : "bg-black"
              }`}
            />
          </button>
        </header>
      )}

      <nav
        ref={overlayRef}
        style={{ clipPath: closedInitial, backgroundColor: overlayBg }}
        className={`fixed inset-0 z-60 flex flex-col items-center justify-center gap-2 overflow-y-auto ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isOpen}
        role="navigation"
      >
        {/* min-h-screen, not h-screen: content shorter than the viewport still
            fills it, but content taller than it (e.g. a lot of links at a
            small window height) can grow past 100vh instead of being
            clamped and clipped — the overflow-y-auto above then scrolls it. */}
        <div ref={linksWrapperRef} className="flex min-h-screen w-screen flex-col items-center justify-center motion-reduce:opacity-100">
          {children
            ? children(isOpen)
            : (links as FullscreenNavLink[]).map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={isOpen ? requestClose : undefined}
                  tabIndex={isOpen ? 0 : -1}
                  style={{ color: linkColor }}
                  onMouseEnter={onLinkMouseEnter}
                  onMouseLeave={onLinkMouseLeave}
                  className={`${linkSizeClass} font-normal tracking-tight transition-colors motion-reduce:transition-none`}
                >
                  {label}
                </a>
              ))}
        </div>
      </nav>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * CustomNavbar — a fuller panel layout (links, image row, brand/tagline,
 * socials, location) meant to be passed as FullscreenNav's children render
 * prop. Handles its own reveal animation keyed off `isOpen`.
 * ------------------------------------------------------------------ */

const SOCIAL_ICONS: Record<string, ReactNode> = {
  instagram: (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 max-[1025px]:h-8 max-[1025px]:w-8 max-md:h-6 max-md:w-6">
      <path d="M5.87988 0.0556641H15.1201C16.6642 0.0574604 18.1445 0.671867 19.2363 1.76367C20.3281 2.85548 20.9425 4.33584 20.9443 5.87988V15.1201C20.9425 16.6642 20.3281 18.1445 19.2363 19.2363C18.1445 20.3281 16.6642 20.9425 15.1201 20.9443H5.87988C4.33584 20.9425 2.85548 20.3281 1.76367 19.2363C0.671867 18.1445 0.0574604 16.6642 0.0556641 15.1201V5.87988C0.0574603 4.33584 0.671867 2.85548 1.76367 1.76367C2.85548 0.671867 4.33584 0.0574603 5.87988 0.0556641ZM12.4502 5.79199C11.519 5.40629 10.4944 5.30533 9.50586 5.50195C8.51734 5.69858 7.60917 6.1838 6.89648 6.89648C6.1838 7.60917 5.69858 8.51734 5.50195 9.50586C5.30533 10.4944 5.40629 11.519 5.79199 12.4502C6.1777 13.3813 6.83093 14.1774 7.66895 14.7373C8.50694 15.2972 9.49217 15.5957 10.5 15.5957C11.8511 15.5942 13.1462 15.0569 14.1016 14.1016C15.0569 13.1462 15.5942 11.8511 15.5957 10.5C15.5957 9.49217 15.2972 8.50694 14.7373 7.66895C14.1774 6.83093 13.3813 6.1777 12.4502 5.79199ZM10.5 7.19629C11.376 7.19731 12.2156 7.54564 12.835 8.16504C13.4544 8.78444 13.8027 9.62403 13.8037 10.5C13.8037 11.1535 13.6101 11.7926 13.2471 12.3359C12.8841 12.8791 12.3682 13.3027 11.7646 13.5527C11.1609 13.8028 10.4964 13.8677 9.85547 13.7402C9.21456 13.6127 8.62614 13.298 8.16406 12.8359C7.70199 12.3739 7.38725 11.7854 7.25977 11.1445C7.13228 10.5036 7.19719 9.83908 7.44727 9.23535C7.6973 8.63179 8.1209 8.11594 8.66406 7.75293C9.1395 7.43525 9.68836 7.24712 10.2559 7.20508L10.5 7.19629ZM15.7031 3.74902C15.4479 3.79981 15.2133 3.92535 15.0293 4.10938C14.8453 4.29341 14.7197 4.52794 14.6689 4.7832C14.6182 5.03848 14.6445 5.30348 14.7441 5.54395C14.8437 5.78413 15.0124 5.98926 15.2285 6.13379C15.4449 6.27838 15.6997 6.35644 15.96 6.35645C16.309 6.35645 16.6438 6.21747 16.8906 5.9707C17.1374 5.72392 17.2764 5.38905 17.2764 5.04004C17.2764 4.77977 17.1993 4.525 17.0547 4.30859C16.9101 4.09225 16.7042 3.92384 16.4639 3.82422C16.2234 3.72462 15.9584 3.69825 15.7031 3.74902Z" fill="white" stroke="white" strokeWidth="0.111973" />
    </svg>
  ),
  facebook: (
    <svg width="10" height="19" viewBox="0 0 10 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 max-[1025px]:h-8 max-[1025px]:w-8 max-md:h-6 max-md:w-6">
      <path d="M6.38184 0.385742C7.19227 0.274662 7.98805 0.34229 8.85449 0.37793C9.03979 0.385348 9.22788 0.406595 9.4248 0.431641V2.80859C8.97946 2.81236 8.52504 2.81344 8.07422 2.82324L7.51758 2.8418C7.15961 2.85609 6.84471 2.96157 6.59375 3.16797C6.34339 3.37392 6.18263 3.65902 6.09375 3.9873L6.0918 3.99414C6.05287 4.15011 6.02498 4.32615 6.02441 4.49707C6.01276 5.25508 6.0127 6.0129 6.0127 6.76758C6.0127 6.81651 6.02031 6.86155 6.02539 6.88867C6.0298 6.91218 6.0385 6.95323 6.04199 6.9707L6.09375 7.23242H9.27637C9.16172 8.14171 9.04553 9.02094 8.93066 9.92773H6.02441V18.5254H3.20312V9.91602H0.325195V7.20898H3.20312V6.66309C3.20312 5.94768 3.19164 5.24969 3.20312 4.55664C3.21466 4.10654 3.23786 3.67817 3.32422 3.26758L3.3252 3.2627C3.63481 1.67136 4.77561 0.611071 6.38184 0.385742Z" fill="white" stroke="white" strokeWidth="0.65" />
    </svg>
  ),
  twitter: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 max-[1025px]:h-8 max-[1025px]:w-8 max-md:h-6 max-md:w-6">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" fill="white" />
    </svg>
  ),
  linkedin: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 max-[1025px]:h-8 max-[1025px]:w-8 max-md:h-6 max-md:w-6">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.064 2.064 0 1 1 0-4.128 2.064 2.064 0 0 1 0 4.128ZM7.119 20.452H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0Z" fill="white" />
    </svg>
  ),
};

export type SocialIconKey = keyof typeof SOCIAL_ICONS;

export interface CustomNavbarProps {
  isOpen: boolean;
  links: FullscreenNavLink[];
  imageSrc?: string;
  imageAlt?: string;
  brand?: string;
  tagline?: string;
  socials?: SocialIconKey[];
  locationLabel?: string;
  onLinkClick?: (link: FullscreenNavLink) => void;
}

export function CustomNavbar({
  isOpen,
  links,
  imageSrc,
  imageAlt = "",
  brand = "Hyperiux",
  tagline,
  socials = [],
  locationLabel,
  onLinkClick,
}: CustomNavbarProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        listRef.current?.children ?? [],
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.07, delay: 0.35, ease: "power3.out" },
      );
      gsap.fromTo(
        footerRef.current,
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, delay: 0.7, ease: "power2.out" },
      );
    });
    return () => ctx.revert();
  }, [isOpen]);

  return (
    <div className="flex min-h-screen w-full flex-col justify-between px-8 pb-16 pt-28 max-[1025px]:px-10 max-md:px-6">
      <nav className="flex flex-col items-start" aria-label="Main">
        <div ref={listRef} className="flex flex-col items-start gap-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => onLinkClick?.(link)}
              tabIndex={isOpen ? 0 : -1}
              className="text-4xl font-normal tracking-tight text-white transition-colors hover:text-neutral-400 max-[1025px]:text-5xl max-md:text-3xl"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      <div ref={footerRef} className="mt-10 flex flex-col gap-8">
        {imageSrc && (
          <img src={imageSrc} alt={imageAlt} className="h-40 w-full rounded-2xl object-cover max-[1025px]:h-48 max-md:h-32" />
        )}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-lg font-semibold uppercase tracking-[0.15em] text-white">{brand}</p>
            {tagline && <p className="mt-1 text-sm text-neutral-400">{tagline}</p>}
          </div>
          <div className="flex items-center gap-4">
            {socials.map((social) => (
              <span key={social} className="opacity-80">
                {SOCIAL_ICONS[social]}
              </span>
            ))}
          </div>
          {locationLabel && <p className="text-sm text-neutral-400">{locationLabel}</p>}
        </div>
      </div>
    </div>
  );
}

export { SOCIAL_ICONS };
