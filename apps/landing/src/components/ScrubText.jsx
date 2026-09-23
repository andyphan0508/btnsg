import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/scroll.js";

/**
 * Đoạn văn "thắp sáng" theo cuộn: từng chữ đi từ mờ sang rõ khi người xem cuộn qua.
 * parts: chuỗi thường, { hl: "chuỗi được nhấn màu nắng" } hoặc { node: <phần tử chèn giữa dòng /> }.
 */
export default function ScrubText({ as: Tag = "p", className = "", parts }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion) return;
      gsap.fromTo(
        ".scrub-w",
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 82%", end: "bottom 48%", scrub: true },
        },
      );
    },
    { scope: ref },
  );

  let key = 0;
  const words = [];
  for (const part of parts) {
    if (part.node) {
      words.push(<span className="scrub-w" key={key++}>{part.node}</span>, " ");
      continue;
    }
    const highlight = typeof part === "object";
    for (const word of (highlight ? part.hl : part).split(/\s+/).filter(Boolean)) {
      words.push(
        <span className={`scrub-w${highlight ? " is-hl" : ""}`} key={key++}>
          {word}
        </span>,
        " ",
      );
    }
  }

  return (
    <Tag className={`scrub ${className}`} ref={ref}>
      {words}
    </Tag>
  );
}
