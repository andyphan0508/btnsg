import { useEffect, useState } from "react";
import MediaTile from "./MediaTile.jsx";
import EmptyState from "./EmptyState.jsx";
import { iconFor } from "../lib/icons.js";
import { content } from "../lib/siteContent.js";
import { Rich } from "../lib/rich.jsx";
import { cardImages, loadImages } from "../lib/gallery.js";

// Nền gradient khi thẻ chưa có ảnh nào (tông nắng/chàm xen kẽ).
const FALLBACK_HUES = [22, 250, 34, 330, 14, 268];

/**
 * Accordion ngang: sáu lát ảnh dọc, lát được chọn nở rộng ra để lộ nội dung trên tấm kính mờ.
 * Di chuột / bấm / focus bàn phím đều mở được; màn hình hẹp chuyển thành accordion dọc.
 */
export default function Ministries() {
  const [active, setActive] = useState(0);
  const [library, setLibrary] = useState([]);
  const { home, ministries } = content;
  const images = cardImages(ministries, library, { seed: "muc-vu-accordion" });

  useEffect(() => {
    let alive = true;
    loadImages()
      .then((all) => alive && setLibrary(all))
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
            <Rich text={home.ministriesTitle} />
          </h2>
          <p className="lead">{home.ministriesLead}</p>
        </header>

        {ministries.length === 0 ? (
          <EmptyState
            icon="default"
            compact
            title="Chưa có thông tin mục vụ"
            description="Danh sách các mảng mục vụ của Ban Thanh Niên sẽ sớm được cập nhật tại đây."
          />
        ) : (
          <div className="acc">
            {ministries.map((m, i) => {
              const Icon = iconFor(m.icon);
              const open = active === i;
              return (
                <article
                  key={i}
                  className={`acc-item sfx-rise${open ? " is-open" : ""}`}
                  style={{ "--i": i }}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  <div className="acc-media">
                    {images[i] ? (
                      <MediaTile image={images[i]} width={900} />
                    ) : (
                      <div className="media-tile media-demo" style={{ "--h": FALLBACK_HUES[i % FALLBACK_HUES.length] }} />
                    )}
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
        )}
      </div>
    </section>
  );
}
