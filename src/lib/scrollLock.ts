/**
 * Helper to fix the viewport height and width when modals/drawers are open,
 * completely preventing background scrolling on desktop, tablet, and mobile browsers.
 */

let lockCount = 0;
let preservedScrollY = 0;

export function lockViewportScroll(): () => void {
  if (typeof document === "undefined") return () => {};

  const body = document.body;
  const html = document.documentElement;

  if (lockCount === 0) {
    preservedScrollY = window.scrollY || window.pageYOffset || 0;
    
    // Fix width to screen and height to viewport
    html.style.overflow = "hidden";
    html.style.height = "100dvh";
    
    body.style.position = "fixed";
    body.style.top = `-${preservedScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.maxWidth = "100vw";
    body.style.height = "100dvh";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
  }

  lockCount++;

  return () => {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      html.style.overflow = "";
      html.style.height = "";
      
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.maxWidth = "";
      body.style.height = "";
      body.style.overflow = "";
      body.style.touchAction = "";

      window.scrollTo(0, preservedScrollY);
    }
  };
}
