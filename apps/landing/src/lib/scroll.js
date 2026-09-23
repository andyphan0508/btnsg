import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, useGSAP);
// Thanh địa chỉ trên mobile ẩn/hiện không cần tính lại mọi ScrollTrigger.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, useGSAP };

export const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

export const finePointer = window.matchMedia(
  "(hover: hover) and (pointer: fine)",
).matches;

/**
 * Lenis: cuộn quán tính cho chuột/trackpad (cảm ứng giữ cuộn gốc của hệ điều hành),
 * chạy chung nhịp với GSAP để mọi ScrollTrigger khớp từng khung hình.
 */
export const lenis = prefersReducedMotion
  ? null
  : new Lenis({ lerp: 0.09, allowNestedScroll: true, stopInertiaOnNavigate: true });

if (lenis) {
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Font web tải xong làm đổi chiều cao chữ → đo lại vị trí các ScrollTrigger.
document.fonts?.ready.then(() => ScrollTrigger.refresh());

export function scrollToTop({ smooth = false } = {}) {
  if (lenis) lenis.scrollTo(0, { immediate: !smooth, force: true });
  else window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
}

let lockCount = 0;

/** Khoá cuộn trang khi mở modal / sheet / lightbox (dừng cả Lenis). */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    lockCount += 1;
    lenis?.stop();
    document.documentElement.classList.add("is-locked");
    return () => {
      lockCount -= 1;
      if (lockCount > 0) return;
      lenis?.start();
      document.documentElement.classList.remove("is-locked");
    };
  }, [active]);
}

// Vệt sáng phản chiếu chạy theo con trỏ trên các bề mặt kính có [data-sheen].
if (finePointer) {
  document.addEventListener(
    "pointermove",
    (e) => {
      const el = e.target.closest?.("[data-sheen]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    },
    { passive: true },
  );
}

/**
 * Chuyển động dùng chung cho Hero trang chủ và PageHero:
 * chữ bay lên khi vào trang, khung ảnh nghiêng 3D theo con trỏ,
 * cả khối lùi sâu vào không gian 3D khi cuộn qua.
 */
export function useHeroMotion(root) {
  useGSAP(
    () => {
      if (prefersReducedMotion) return undefined;
      const el = root.current;

      gsap.fromTo(
        ".hero-word",
        { yPercent: 55, opacity: 0, filter: "blur(12px)" },
        {
          yPercent: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.2,
          stagger: 0.06,
          ease: "expo.out",
          clearProps: "filter",
        },
      );
      gsap.from(".hero-fade", {
        y: 28,
        opacity: 0,
        duration: 1.1,
        stagger: 0.12,
        delay: 0.35,
        ease: "expo.out",
      });
      gsap.from(".hero-visual-in", {
        opacity: 0,
        yPercent: 16,
        rotationY: -38,
        rotationX: 20,
        scale: 0.86,
        transformPerspective: 1400,
        duration: 1.8,
        delay: 0.1,
        ease: "expo.out",
      });

      gsap
        .timeline({
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
        })
        .to(
          ".hero-copy",
          {
            yPercent: -16,
            rotationX: 14,
            scale: 0.94,
            opacity: 0.08,
            transformPerspective: 1200,
            transformOrigin: "50% 100%",
            ease: "none",
          },
          0,
        )
        .to(
          ".hero-visual",
          {
            yPercent: -22,
            rotationY: -24,
            rotationX: 12,
            opacity: 0.35,
            transformPerspective: 1600,
            ease: "none",
          },
          0,
        )
        .to(".hero-rays", { rotation: 100, scale: 1.18, opacity: 0, ease: "power1.in" }, 0);

      if (!finePointer) return undefined;
      const onMove = (e) => {
        el.style.setProperty("--px", (e.clientX / window.innerWidth - 0.5).toFixed(3));
        el.style.setProperty("--py", (e.clientY / window.innerHeight - 0.5).toFixed(3));
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: root },
  );
}
