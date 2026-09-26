// Ensures scrolling is always enabled across the entire app at all times,
// even when opening popups, dialogs, selects, dropdowns, or mobile menus.

if (typeof window !== "undefined") {
  const patchEventListener = (target: EventTarget | null) => {
    if (!target) return;
    const originalAddEventListener = target.addEventListener.bind(target);
    target.addEventListener = function (
      type: string,
      listener: any,
      options?: any
    ) {
      // Force passive for wheel and touchmove so libraries cannot call event.preventDefault()
      // to lock page scrolling when popups/options open.
      if (type === "wheel" || type === "touchmove") {
        if (typeof options === "object" && options !== null) {
          options = { ...options, passive: true };
        } else {
          options = { passive: true };
        }
      }
      return originalAddEventListener(type, listener, options);
    };
  };

  patchEventListener(window);
  patchEventListener(document);
  if (typeof document !== "undefined") {
    patchEventListener(document.documentElement);
    if (document.body) {
      patchEventListener(document.body);
    }
  }

  const clearScrollLocks = () => {
    if (document.body) {
      if (document.body.style.overflow === "hidden") {
        document.body.style.removeProperty("overflow");
      }
      if (document.body.getAttribute("data-scroll-locked")) {
        document.body.removeAttribute("data-scroll-locked");
      }
      if (document.body.style.pointerEvents === "none") {
        document.body.style.removeProperty("pointer-events");
      }
    }
    if (document.documentElement) {
      if (document.documentElement.style.overflow === "hidden") {
        document.documentElement.style.removeProperty("overflow");
      }
      if (document.documentElement.getAttribute("data-scroll-locked")) {
        document.documentElement.removeAttribute("data-scroll-locked");
      }
    }
  };

  clearScrollLocks();

  // Watch for any library or popup trying to inject data-scroll-locked or overflow: hidden
  const observer = new MutationObserver(clearScrollLocks);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["style", "data-scroll-locked"],
  });

  if (document.body) {
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "data-scroll-locked"],
    });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      if (document.body) {
        patchEventListener(document.body);
        observer.observe(document.body, {
          attributes: true,
          attributeFilter: ["style", "data-scroll-locked"],
        });
        clearScrollLocks();
      }
    });
  }
}

export {};
