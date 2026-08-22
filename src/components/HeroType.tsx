"use client";

import * as React from "react";
import { useMediaQuery } from "@/lib/hooks";

const CHAR_MS = 105;
const START_DELAY_MS = 240;

/**
 * The desktop hero, typed out one character at a time in phosphor lime with a
 * blinking block caret.
 *
 * The real string is always in the DOM as visually-hidden text, so the heading
 * is readable without JavaScript and to assistive tech; the animated copy is
 * `aria-hidden` decoration on top of it.
 */
export function HeroType({ text, className }: { text: string; className?: string }) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  /* Starts empty so the server and first client render agree. */
  const [shown, setShown] = React.useState(0);

  React.useEffect(() => {
    if (reduced) {
      setShown(text.length);
      return;
    }

    /* Retype from the start on every visit to the desktop. */
    setShown(0);
    let i = 0;
    let step: number | undefined;

    const begin = window.setTimeout(() => {
      step = window.setInterval(() => {
        i += 1;
        setShown(i);
        if (i >= text.length && step !== undefined) window.clearInterval(step);
      }, CHAR_MS);
    }, START_DELAY_MS);

    return () => {
      window.clearTimeout(begin);
      if (step !== undefined) window.clearInterval(step);
    };
  }, [text, reduced]);

  const typing = shown < text.length;

  return (
    <h1 className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="vk-crt vk-crt-flicker">
        {text.slice(0, shown)}
        <span
          className="vk-crt-caret"
          /* The caret holds steady while characters are landing, then blinks. */
          style={typing && !reduced ? { animation: "none" } : undefined}
        />
      </span>
    </h1>
  );
}
