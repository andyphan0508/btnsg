import { Fragment, useRef } from "react";
import { Link } from "react-router-dom";
import { PiArrowRight } from "react-icons/pi";
import { useHeroMotion } from "../lib/scroll.js";
import Rays from "./Rays.jsx";
import InkPill from "./InkPill.jsx";
import RollText from "./RollText.jsx";
import { content, heroImage } from "../lib/siteContent.js";
import { parseRich } from "../lib/rich.jsx";
import logoImg from "../assets/logobtnsg.webp";

/** Tách câu thành từng từ để chữ bay lên lần lượt khi vào trang. */
export function HeroWords({ text, className = "" }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span className={`hero-word ${className}`}>{word}</span>
    </Fragment>
  ));
}

/** Một dòng tiêu đề: chữ thường bay lên từng từ, *đoạn nhấn* màu nắng, {anh} → viên ảnh. */
function HeroLine({ text, photo }) {
  const parts = parseRich(text).filter((part) => !part.text || part.text.trim());
  return (
    <span className="hero-line">
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          {part.token ? (
            <span className="hero-word">
              {part.token === "logo" ? (
                <InkPill src={logoImg} size="78%" className="is-logo" />
              ) : (
                <InkPill src={photo} position="47% 74%" size="330%" />
              )}
            </span>
          ) : (
            <HeroWords text={(part.hl ?? part.text).trim()} className={part.hl ? "text-sun" : ""} />
          )}
        </Fragment>
      ))}
    </span>
  );
}

/**
 * Hero bất đối xứng: tiêu đề lệch trái, khung ảnh kính nghiêng 3D đè lên từ góc phải dưới,
 * phía sau là vầng tia sáng của biểu trưng. Cuộn xuống, cả khối lùi sâu vào không gian.
 */
export default function Hero() {
  const root = useRef(null);
  useHeroMotion(root);
  const { hero } = content;
  const photo = heroImage();

  return (
    <header className="hero" ref={root}>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="hero-org hero-fade">
            <img src={logoImg} alt="" />
            {hero.org}
          </p>

          <h1 className="hero-title">
            <HeroLine text={hero.line1} photo={photo} />{" "}
            <HeroLine text={hero.line2} photo={photo} />
          </h1>

          <p className="hero-lead hero-fade">{hero.lead}</p>

          <div className="hero-actions hero-fade">
            <Link className="btn btn-sun" to="/sinh-hoat">
              <RollText text={hero.ctaPrimary} />
              <span className="btn-icon">
                <PiArrowRight />
              </span>
            </Link>
            <Link className="btn btn-glass" to="/gioi-thieu">
              <RollText text={hero.ctaSecondary} />
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-visual-in">
            <div className="hero-glow" aria-hidden="true" />
            <Rays className="hero-rays" />
            <figure className="hero-frame">
              <img src={photo} alt={hero.imageAlt} fetchpriority="high" />
              <span className="hero-frame-sheen" aria-hidden="true" />
            </figure>
          </div>
        </div>
      </div>
    </header>
  );
}
