/**
 * Helper to fix the viewport height and width when modals/drawers are open,
 * completely preventing background scrolling on desktop, tablet, and mobile browsers
 * without altering body position:fixed, which breaks fixed-centered modal coordinates.
 */

let lockCount = 0;
let savedScrollY = 0;

export function lockViewportScroll(): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") return () => {};

  const body = document.body;
  const html = document.documentElement;

  if (lockCount === 0) {
    // Save current scroll position
    savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    html.classList.add("viewport-locked");
    body.classList.add("viewport-locked");
  }

  lockCount++;

  return () => {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      html.classList.remove("viewport-locked");
      body.classList.remove("viewport-locked");
      // Restore previous scroll position immediately
      window.scrollTo({
        top: savedScrollY,
        behavior: "instant" as ScrollBehavior,
      });
      // Double check on next frame to counter any browser layout adjustments
      requestAnimationFrame(() => {
        window.scrollTo({
          top: savedScrollY,
          behavior: "instant" as ScrollBehavior,
        });
      });
    }
  };
}

