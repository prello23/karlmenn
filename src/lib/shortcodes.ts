// Shortcode support for editable page HTML. Plain module (no server/client
// directive) so it can be used from both server components and client code.

/** The story-counter shortcode authors type in the WYSIWYG editor. */
export const SOGUR_TELJARI = "[sogur-teljari]";

/** Class of the empty element a StoryCounter is hydrated into on the client. */
export const COUNTER_MOUNT_CLASS = "sogur-teljari-mount";

/**
 * Replace every [sogur-teljari] token with an empty mount point. Done on the
 * server so the raw token never reaches the client/props payload, and the
 * surrounding admin HTML is preserved exactly.
 */
export function injectCounterMounts(html: string): string {
  return html
    .split(SOGUR_TELJARI)
    .join(`<span class="${COUNTER_MOUNT_CLASS}"></span>`);
}
