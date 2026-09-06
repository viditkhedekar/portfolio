/**
 * The mode gate, kept deliberately free of "use client".
 *
 * This is imported by the root layout, which is a server component. A value
 * exported from a client module and read on the server is not the value: it
 * is a client reference, and stringifying one into a script tag injects
 * `function() {` into the document head. That is exactly what happened, and
 * it silently disabled low-RAM mode, because the attribute the whole feature
 * reads was never written.
 *
 * So the constants live here, where both sides get the real thing, and
 * `src/lib/mode.ts` holds the parts that genuinely need the browser.
 */

export type Mode = "world" | "lite";

export const MODE_KEY = "vkos.mode";

/**
 * Resolves the mode before first paint, so a machine that cannot afford the
 * world never starts fetching it.
 *
 * Save-Data is honoured because it is an explicit request from the visitor,
 * not a guess about their hardware. Device memory is deliberately not
 * consulted: most phones report four gigabytes or less, and sending every
 * phone to the reduced page is not what it is for.
 */
export const MODE_SCRIPT = [
  "try{",
  `var m=localStorage.getItem('${MODE_KEY}');`,
  "if(m!=='lite'&&m!=='world'){",
  "var c=navigator.connection;",
  "m=(c&&c.saveData)?'lite':'world';",
  "}",
  "document.documentElement.setAttribute('data-mode',m);",
  "}catch(e){document.documentElement.setAttribute('data-mode','world');}",
].join("");
