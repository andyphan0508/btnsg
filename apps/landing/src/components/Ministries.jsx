import { useEffect, useState } from "react";
import {
  PiFlame,
  PiMegaphone,
  PiHandHeart,
  PiCompass,
  PiGraduationCap,
  PiUsersThree,
} from "react-icons/pi";
import MediaTile from "./MediaTile.jsx";
import { ministries } from "../data/content.js";
import { loadImages, pickImages } from "../lib/gallery.js";

export const MINISTRY_ICONS = {
  flame: PiFlame,
  megaphone: PiMegaphone,
  heart: PiHandHeart,
  compass: PiCompass,
  training: PiGraduationCap,
  friends: PiUsersThree,
};

/**
 * Accordion ngang: sáu lát ảnh dọc, lát được chọn nở rộng ra để lộ nội dung trên tấm kính mờ.
 * Di chuột / bấm / focus bàn phím đều mở được; màn hình hẹp chuyển thành accordion dọc.
 */
export default function Ministries() {
  const [active, setActive] = useState(0);
  const [images, setImages] = useState([]);

  useEffect(() => {
    let alive = true;
    loadImages()
      .then((all) => alive && setImages(pickImages(all, "muc-vu-accordion", ministries.length)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <h2>
            Được gây dựng để <em>đi ra</em>
          </h2>
          <p className="lead">
            Sáu mảng mục vụ giúp người trẻ trưởng thành trong đức tin, gắn kết tình thân và mang
            Tin Lành đến cho thành phố.
          </p>
        </header>

        <div className="acc">
          {ministries.map((m, i) => {
            const Icon = MINISTRY_ICONS[m.icon];
            const open = active === i;
            return (
              <article
                key={m.title}
                className={`acc-item sfx-rise${open ? " is-open" : ""}`}
                style={{ "--i": i }}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                <div className="acc-media">
                  {images[i] && <MediaTile image={images[i]} width={900} />}
                </div>
                <button
                  type="button"
                  className="acc-trigger"
                  aria-expanded={open}
                  onFocus={() => setActive(i)}
                >
                  <span className="acc-icon">
                    <Icon />
                  </span>
                  <span className="acc-label">{m.title}</span>
                </button>
                <div className="acc-body" aria-hidden={!open}>
                  <span className="acc-kind">{m.kind}</span>
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
