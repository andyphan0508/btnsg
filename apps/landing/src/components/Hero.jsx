import { Fragment, useRef } from "react";
import { Link } from "react-router-dom";
import { PiArrowRight } from "react-icons/pi";
import { useHeroMotion } from "../lib/scroll.js";
import Rays from "./Rays.jsx";
import InkPill from "./InkPill.jsx";
import RollText from "./RollText.jsx";
import logoImg from "../assets/logobtnsg.jpg";
import groupPhoto from "../assets/background.jpg";

/** Tách câu thành từng từ để chữ bay lên lần lượt khi vào trang. */
export function HeroWords({ text, className = "" }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span className={`hero-word ${className}`}>{word}</span>
    </Fragment>
  ));
}

/**
 * Hero bất đối xứng: tiêu đề lệch trái, khung ảnh kính nghiêng 3D đè lên từ góc phải dưới,
 * phía sau là vầng tia sáng của biểu trưng. Cuộn xuống, cả khối lùi sâu vào không gian.
 */
export default function Hero() {
  const root = useRef(null);
  useHeroMotion(root);

  return (
    <header className="hero" ref={root}>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="hero-org hero-fade">
            <img src={logoImg} alt="" />
            Ban Thanh Niên · Hội Thánh Tin Lành Sài Gòn
          </p>

          <h1 className="hero-title">
            <span className="hero-line">
              <HeroWords text="Gặp Chúa, gặp nhau" />{" "}
              <span className="hero-word">
                <InkPill src={groupPhoto} position="47% 74%" size="330%" />
              </span>
            </span>{" "}
            <span className="hero-line">
              <HeroWords text="và cùng" /> <HeroWords text="tỏa sáng." className="text-sun" />
            </span>
          </h1>

          <p className="hero-lead hero-fade">
            Nơi người trẻ Sài Gòn cùng thờ phượng, học Lời Chúa và sống cho điều cao đẹp. Hẹn
            bạn mỗi chiều Chúa Nhật lúc 14:30.
          </p>

          <div className="hero-actions hero-fade">
            <Link className="btn btn-sun" to="/sinh-hoat">
              <RollText text="Tham gia Chúa Nhật này" />
              <span className="btn-icon">
                <PiArrowRight />
              </span>
            </Link>
            <Link className="btn btn-glass" to="/gioi-thieu">
              <RollText text="Câu chuyện của chúng tôi" />
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-visual-in">
            <div className="hero-glow" aria-hidden="true" />
            <Rays className="hero-rays" />
            <figure className="hero-frame">
              <img
                src={groupPhoto}
                alt="Các bạn trẻ Ban Thanh Niên vẫy tay chào trong buổi nhóm Giáng Sinh"
              />
              <span className="hero-frame-sheen" aria-hidden="true" />
            </figure>
          </div>
        </div>
      </div>
    </header>
  );
}
