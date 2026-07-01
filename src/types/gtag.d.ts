// Global typing for the Google Analytics gtag.js helper injected in the root
// layout. Lets client components call window.gtag(...) with type safety.
export {};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
