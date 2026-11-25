"use client";

import { ArrowDown, ArrowUpRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { growencyUrl } from "@/lib/data/portfolio";

const reelSrc = "/projects/growency/spec-reel.mp4";
const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function MetaReel({ servicesId }: { servicesId: string }) {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const scrub = useRef<HTMLInputElement>(null);
  const manuallyPaused = useRef(false);
  const drag = useRef<{ pointer: number; x: number; time: number } | null>(null);
  const seekFrame = useRef(0);
  const targetTime = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const section = root.current;
    const player = video.current;
    const view = frame.current;
    if (!section || !player || !view) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    function syncPlayback() {
      if (!player) return;
      if (visible && !document.hidden && !motion.matches && !manuallyPaused.current) void player.play().catch(() => {});
      else player.pause();
    }
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: .25 });
    visibility.observe(view);
    player.defaultPlaybackRate = .6;
    player.playbackRate = .6;

    let scrollFrame = 0;
    function renderScroll() {
      scrollFrame = 0;
      if (!section || !view) return;
      const top = view.getBoundingClientRect().top;
      const distance = window.innerHeight;
      const progress = clamp((distance * .72 - top) / (distance * .45));
      const eased = progress * progress * (3 - 2 * progress);
      const unwind = clamp((distance * .45 - section.getBoundingClientRect().bottom) / (distance * .3));
      view.style.setProperty("--reel-progress", String(eased));
      view.style.setProperty("--reel-zoom", String(1.035 + eased * .04 - unwind * .045));
      view.style.setProperty("--reel-inset", String(unwind));
    }

    function onScroll() {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(renderScroll);
    }

    renderScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    motion.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      visibility.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      motion.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      window.cancelAnimationFrame(scrollFrame);
      window.cancelAnimationFrame(seekFrame.current);
    };
  }, []);

  function toggle() {
    const player = video.current;
    if (!player) return;
    manuallyPaused.current = !player.paused;
    if (player.paused) void player.play().catch(() => {});
    else player.pause();
  }

  function seek(time: number) {
    const player = video.current;
    if (!player || !duration) return;
    player.currentTime = Math.max(0, Math.min(time, duration));
    if (scrub.current) scrub.current.value = String(player.currentTime);
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    const player = video.current;
    if (!player || !duration || event.button !== 0 || drag.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointer: event.pointerId, x: event.clientX, time: player.currentTime };
  }

  function trackDrag(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (start?.pointer !== event.pointerId || Math.abs(start.x - event.clientX) < 6) return;
    manuallyPaused.current = true;
    video.current?.pause();
    const offset = start.time + (start.x - event.clientX) / event.currentTarget.clientWidth * duration * .45;
    targetTime.current = (offset % duration + duration) % duration;
    if (seekFrame.current) return;
    seekFrame.current = window.requestAnimationFrame(() => {
      seekFrame.current = 0;
      seek(targetTime.current);
    });
  }

  return (
    <section ref={root} className="meta-reel" aria-label="Creative reel">
      <div className="meta-reel-frame" ref={frame}>
        <div
          className="meta-reel-media"
          onPointerDown={startDrag}
          onPointerMove={trackDrag}
          onLostPointerCapture={(event) => {
            if (drag.current?.pointer === event.pointerId) drag.current = null;
          }}
        >
          <video
            ref={video}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Growency sample ad reel"
            poster="/projects/growency/spec-reel.jpg"
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
            onTimeUpdate={(event) => {
              if (scrub.current) scrub.current.value = String(event.currentTarget.currentTime);
            }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            <source src={reelSrc} type="video/mp4" />
            <a href={reelSrc}>Watch the creative reel</a>
          </video>
        </div>
        <div className="meta-reel-copy">
          <h3><span>We are the hedge fund</span> <span>for Meta ads.</span></h3>
          <p>Before each test, we agree on a budget and what a sale or qualified lead can cost.</p>
          <div className="meta-reel-actions">
            <a href={new URL("book", growencyUrl).href}>Let’s talk ads <ArrowUpRight size={16} aria-hidden="true" /></a>
            <a href={`#${servicesId}`}>What we do <ArrowDown size={15} aria-hidden="true" /></a>
          </div>
        </div>
      </div>
      <div className="meta-reel-controls">
        <button type="button" onClick={toggle} aria-label={playing ? "Pause the creative reel" : "Play the creative reel"}>
          {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        </button>
        <label>
          <span>Scrub reel</span>
          <input ref={scrub} type="range" min={0} max={duration || 1} step={.05} defaultValue={0} disabled={!duration} onChange={(event) => {
            manuallyPaused.current = true;
            video.current?.pause();
            seek(event.currentTarget.valueAsNumber);
          }} />
        </label>
      </div>
      <p className="showcase-caption">Growency spec work. The brands shown did not commission these ads.</p>
    </section>
  );
}
