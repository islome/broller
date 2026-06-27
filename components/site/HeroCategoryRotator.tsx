"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const FALLBACK_WORDS = ["texnika", "ventilyatsiya", "isitish", "oziqlantirish"];
const ROTATE_MS = 5000;

export default function HeroCategoryRotator({ words }: { words: string[] }) {
  const items = useMemo(() => {
    const cleaned = words.map((word) => word.trim()).filter(Boolean);
    return cleaned.length > 0 ? cleaned : FALLBACK_WORDS;
  }, [words]);

  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(-1);
  const activeRef = useRef(0);

  // Keep the ref in sync so the interval can read the current index
  // without re-subscribing on every change.
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Reset if the word list itself changes, so indexes never point past it.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(0);
    setPrev(-1);
    activeRef.current = 0;
  }, [items]);

  useEffect(() => {
    if (items.length < 2) return;

    const timer = window.setInterval(() => {
      const current = activeRef.current;
      setPrev(current);
      setActive((current + 1) % items.length);
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [items.length]);

  return (
    <span
      className="relative inline-grid align-baseline"
    >
      {items.map((item, index) => {
        // "in"   → centered & visible
        // "out"  → the word that just left, drifts up & fades out
        // "idle" → waiting below, invisible, ready to rise in
        const state =
          index === active ? "in" : index === prev ? "out" : "idle";

        return (
          <span
            key={`${item}-${index}`}
            aria-hidden={index !== active}
            className={[
              "col-start-1 row-start-1 whitespace-nowrap pr-3 leading-[1.05]",
              "transition-all duration-700 ease-out will-change-transform",
              "motion-reduce:transition-none motion-reduce:transform-none",
              state === "in"
                ? "translate-y-0 opacity-100"
                : state === "out"
                  ? "-translate-y-[0.5em] opacity-0"
                  : "translate-y-[0.5em] opacity-0",
            ].join(" ")}
          >
            <span className="relative inline-block">
              {item}
              <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left rounded-full" />
            </span>
          </span>
        );
      })}
    </span>
  );
}
