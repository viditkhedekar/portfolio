"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { growencySpecAds as ads } from "@/lib/data/growency-spec-ads";

const length = ads.length;
const indexOf = (position: number) => ((position % length) + length) % length;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function cardPose(index: number, position: number) {
  const angle = (index - position) * (2 * Math.PI / length);
  const depth = Math.cos(angle);
  const side = Math.sin(angle);
  const front = (depth + 1) / 2;
  const scale = .57 + .53 * front * front * (3 - 2 * front);
  return {
    transform: `translate(-50%, -50%) translate(calc(${(side * 35 * (.86 + .14 * front)).toFixed(3)} * 1cqw), calc(${(depth * 10.5 + side * 1.6).toFixed(3)} * 1cqw)) rotate(${(side * 5).toFixed(3)}deg) scale(${(scale * (.79 + .21 * Math.abs(depth))).toFixed(4)}, ${scale.toFixed(4)})`,
    zIndex: Math.round(front * 1000),
  };
}

type Gesture = {
  id: number;
  x: number;
  step: number;
  position: number;
  lastX: number;
  lastTime: number;
  speed: number;
  moved: boolean;
};

function previewTransform(source: HTMLButtonElement, image: HTMLImageElement) {
  const original = source.getBoundingClientRect();
  const destination = image.getBoundingClientRect();
  const x = original.x + original.width / 2 - destination.x - destination.width / 2;
  const y = original.y + original.height / 2 - destination.y - destination.height / 2;
  return `translate(${x}px, ${y}px) scale(${original.width / destination.width}, ${original.height / destination.height})`;
}

function AdPreview({ ad, source, close }: { ad: typeof ads[number]; source: HTMLButtonElement; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const animation = useRef<Animation | null>(null);
  const closing = useRef(false);
  const title = useId();

  useLayoutEffect(() => {
    const element = dialog.current;
    const art = image.current;
    if (!element || !art) return;
    if (!element.open) element.showModal();
    closeButton.current?.focus({ preventScroll: true });
    if (!reducedMotion()) {
      animation.current = art.animate([
        { transform: previewTransform(source, art) },
        { transform: "none" },
      ], { duration: 580, easing: "cubic-bezier(.25,.76,.27,1)" });
    }
    return () => animation.current?.cancel();
  }, [source]);

  function dismiss() {
    if (closing.current) return;
    closing.current = true;
    const art = image.current;
    const currentPose = art ? getComputedStyle(art).transform : "none";
    animation.current?.cancel();
    function finish() {
      dialog.current?.close();
      close();
    }
    if (reducedMotion() || !art) {
      finish();
      return;
    }
    dialog.current?.setAttribute("data-closing", "");
    animation.current = art.animate([
      { transform: currentPose },
      { transform: previewTransform(source, art) },
    ], { duration: 420, easing: "cubic-bezier(.39,0,.27,1)", fill: "forwards" });
    void animation.current.finished.then(finish, () => {});
  }

  return (
    <dialog
      ref={dialog}
      className="meta-ad-dialog"
      aria-labelledby={title}
      onKeyDown={(event) => {
        if (event.key === "Escape") event.stopPropagation();
      }}
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <figure className="meta-ad-dialog-figure">
        <Image ref={image} src={ad.src} alt={ad.alt} width={ad.width} height={ad.height} sizes="(max-width: 600px) 90vw, 560px" loading="eager" />
        <figcaption><strong id={title}>{ad.title}</strong><small>{ad.note}</small></figcaption>
        <button ref={closeButton} type="button" className="meta-ad-dialog-close" aria-label="Close ad preview" onClick={dismiss}>
          <X size={20} aria-hidden="true" />
        </button>
      </figure>
    </dialog>
  );
}

export function MetaAdCarousel() {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const selection = useRef(0);
  const position = useRef(0);
  const frame = useRef(0);
  const gesture = useRef<Gesture | null>(null);
  const ignoreClick = useRef(false);
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState<{ index: number; source: HTMLButtonElement } | null>(null);
  const headingId = useId();
  const stageId = useId();
  const hintId = useId();

  useEffect(() => () => window.cancelAnimationFrame(frame.current), []);

  function paint(value: number) {
    position.current = value;
    for (const [index, element] of cards.current.entries()) {
      if (!element) continue;
      const { transform, zIndex } = cardPose(index, value);
      element.style.transform = transform;
      element.style.zIndex = String(zIndex);
    }
  }

  function rotateTo(target: number) {
    window.cancelAnimationFrame(frame.current);
    selection.current = target;
    setActive(indexOf(target));
    if (reducedMotion()) {
      paint(indexOf(target));
      selection.current = indexOf(target);
      return;
    }

    const start = position.current;
    const duration = Math.min(860, 520 + Math.abs(target - start) * 52);
    let startTime: number | undefined;
    function tick(now: number) {
      startTime ??= now;
      const progress = Math.min((now - startTime) / duration, 1);
      const easing = 1 - (1 - progress) ** 4;
      paint(start + (target - start) * easing);
      if (progress < 1) frame.current = window.requestAnimationFrame(tick);
    }
    if (start !== target) frame.current = window.requestAnimationFrame(tick);
  }

  function open(index: number) {
    const source = cards.current[index];
    if (!source) return;
    window.cancelAnimationFrame(frame.current);
    stage.current?.focus({ preventScroll: true });
    setPreview({ index, source });
  }

  function close() {
    setPreview(null);
    stage.current?.focus({ preventScroll: true });
    rotateTo(selection.current);
  }

  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "Enter" || event.key === " ") {
      if (event.target !== event.currentTarget) return;
      event.preventDefault();
      open(active);
      return;
    }
    const current = selection.current;
    const first = current - indexOf(current);
    const targets: Record<string, number> = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: first, End: first + length - 1 };
    const target = targets[event.key];
    if (typeof target !== "number") return;
    event.preventDefault();
    rotateTo(target);
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || gesture.current) return;
    ignoreClick.current = false;
    const x = event.clientX;
    gesture.current = {
      id: event.pointerId,
      x,
      step: Math.max(54, event.currentTarget.clientWidth / (length * .82)),
      position: position.current,
      lastX: x,
      lastTime: event.timeStamp,
      speed: 0,
      moved: false,
    };
  }

  function drag(event: PointerEvent<HTMLDivElement>) {
    const held = gesture.current;
    if (held?.id !== event.pointerId) return;
    const x = event.clientX;
    const distance = held.x - x;
    if (!held.moved) {
      if (Math.abs(distance) <= 7) return;
      window.cancelAnimationFrame(frame.current);
      held.position = position.current;
      held.moved = true;
      ignoreClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.setAttribute("data-dragging", "");
    }
    const now = event.timeStamp;
    const instant = (held.lastX - x) / held.step / Math.max(now - held.lastTime, 8);
    held.speed = .55 * held.speed + .45 * instant;
    held.lastX = x;
    held.lastTime = now;
    if (!reducedMotion()) paint(held.position + distance / held.step);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const held = gesture.current;
    if (held?.id !== event.pointerId) return;
    gesture.current = null;
    if (!held.moved) return;
    event.currentTarget.removeAttribute("data-dragging");
    const glide = event.type === "pointerup" && event.timeStamp - held.lastTime < 85
      ? Math.max(-2, Math.min(2, held.speed * 160))
      : 0;
    const traveled = (held.x - held.lastX) / held.step;
    if (reducedMotion()) {
      rotateTo(Math.round(held.position + traveled));
    } else {
      rotateTo(Math.round(held.position + traveled + glide));
    }
  }

  return (
    <section className="meta-ad-carousel" aria-labelledby={headingId} aria-roledescription="carousel">
      <div className="meta-ad-carousel-header">
        <h3 id={headingId}>Sample ads</h3>
        <div className="meta-ad-controls">
          <button type="button" aria-label="Previous ad" aria-controls={stageId} onClick={() => rotateTo(selection.current - 1)}>
            <ArrowLeft size={19} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Next ad" aria-controls={stageId} onClick={() => rotateTo(selection.current + 1)}>
            <ArrowRight size={19} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        id={stageId}
        ref={stage}
        className="meta-ad-stage"
        role="group"
        aria-label="Growency sample ads"
        aria-describedby={hintId}
        tabIndex={0}
        onKeyDown={navigate}
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={(event) => {
          if (event.target === event.currentTarget) endDrag(event);
        }}
        onPointerLeave={(event) => {
          if (!gesture.current?.moved) endDrag(event);
        }}
      >
        <ul className="meta-ad-ring">
          {ads.map((ad, index) => (
            <li key={ad.id}>
              <button
                ref={(node) => { cards.current[index] = node; }}
                type="button"
                tabIndex={-1}
                aria-label={`Preview ${ad.title}`}
                className="meta-ad-card"
                style={cardPose(index, 0)}
                onClick={(event) => {
                  if (!ignoreClick.current || event.detail === 0) open(index);
                }}
              >
                <Image src={ad.src} alt="" width={ad.width} height={ad.height} sizes="(max-width: 650px) 150px, 240px" draggable={false} loading="eager" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="meta-ad-carousel-caption">
        <div aria-live="polite" aria-atomic="true">
          <strong>{ads[active].title}</strong>
          <small>{ads[active].note}</small>
        </div>
        <p id={hintId}>Drag to rotate · Select an ad to preview <span className="visually-hidden">Use the arrow keys to rotate and Enter to open the selected ad.</span></p>
      </div>
      {preview && <AdPreview ad={ads[preview.index]} source={preview.source} close={close} />}
    </section>
  );
}
