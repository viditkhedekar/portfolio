"use client";

import { useTerminal } from "@/components/TerminalProvider";

/**
 * The way into the terminal from the world.
 *
 * VKOS has had a terminal behind Command-K since before any of this, and
 * almost nobody was ever going to find it. Presenting it as a field you can
 * type into is the whole change: it reads as an invitation rather than as a
 * shortcut for people who already know the shortcut.
 *
 * It is a button wearing an input's clothes. Making it a real field would
 * mean maintaining a second text box that forwards its keystrokes into the
 * terminal's own, and the terminal is the thing that should own typing.
 */
export function TerminalPrompt() {
  const terminal = useTerminal();

  return (
    <button
      type="button"
      onClick={terminal.open}
      className="vk-ask"
      data-cursor="OPEN"
      data-cursor-sub="TERMINAL"
      aria-label="Open the VKOS terminal"
    >
      <span className="vk-ask-caret" aria-hidden="true" />
      <span className="vk-ask-text">ASK ME ANYTHING</span>
      <kbd aria-hidden="true">⌘K</kbd>
    </button>
  );
}
