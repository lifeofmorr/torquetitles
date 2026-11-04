"use client";
import { useEffect, useRef } from "react";

// §9 — the standard's only motion: gentle reveal (opacity + 14px rise, .7s),
// reproduced from enterprise.js semantics: IntersectionObserver at 0.12,
// a 2.6s safety reveal, prefers-reduced-motion disables it, and content is
// never hidden without JS (hidden states exist only under html.js-ent,
// which the layout's head script adds before paint).
export default function Reveal({ children, className = "", as: Tag = "div", ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    const t = setTimeout(() => el.classList.add("in"), 2600);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, []);
  return (
    <Tag ref={ref} data-rv className={className} {...rest}>
      {children}
    </Tag>
  );
}
