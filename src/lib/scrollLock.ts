/**
 * Helper to fix the viewport height and width when modals/drawers are open,
 * completely preventing background scrolling on desktop, tablet, and mobile browsers
 * without altering body position:fixed, which breaks fixed-centered modal coordinates.
 */

let lockCount = 0;

export function lockViewportScroll(): () => void {
  if (typeof document === "undefined") return () => {};

  const body = document.body;
  const html = document.documentElement;

  if (lockCount === 0) {
    html.classList.add("viewport-locked");
    body.classList.add("viewport-locked");
  }

  lockCount++;

  return () => {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      html.classList.remove("viewport-locked");
      body.classList.remove("viewport-locked");
    }
  };
}

