import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PiArrowRight, PiArrowUpRight } from "react-icons/pi";
import { cardImages, loadImages } from "../lib/gallery.js";
import { content } from "../lib/siteContent.js";
import { Rich } from "../lib/rich.jsx";
import MediaTile from "./MediaTile.jsx";
import RollText from "./RollText.jsx";

const isExternal = (url = "") => /^https?:\/\//i.test(url);

/**
 * Hiển thị các khối thông tin bổ sung được quản trị viên thêm từ Dashboard → Website → Cấu trúc web.
 */
const CustomBlocks = ({ page }) => {
  const blocks = (content.customBlocks || []).filter((b) => b.visible !== false && b.page === page && (b.title || b.body));
  const [library, setLibrary] = useState([]);

  useEffect(() => {
    if (!blocks.some((b) => b.tag)) return undefined;
    let alive = true;
    loadImages()
      .then((all) => alive && setLibrary(all))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [blocks.length]);

  if (blocks.length === 0) return null;

  const photos = cardImages(blocks, library, { seed: `custom-${page}`, fallback: false });

  return (
    <section className="section section-tight">
      <div className="wrap custom-blocks">
        {blocks.map((block, i) => {
          const photo = photos[i];
          const hasCta = Boolean(block.ctaLabel && block.ctaUrl);
          return (
            <article className={`custom-block glass${photo ? " has-media" : ""}`} key={`${block.title}-${i}`}>
              {photo && (
                <div className="custom-block-media">
                  <MediaTile image={photo} width={1000} />
                </div>
              )}
              <div className="custom-block-body">
                {block.eyebrow && <span className="empty-state-eyebrow">{block.eyebrow}</span>}
                {block.title && (
                  <h2 className="custom-block-title">
                    <Rich text={block.title} />
                  </h2>
                )}
                {block.body && (
                  <div className="custom-block-text">
                    {block.body
                      .split(/\n+/)
                      .filter(Boolean)
                      .map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))}
                  </div>
                )}
                {hasCta &&
                  (isExternal(block.ctaUrl) ? (
                    <a
                      href={block.ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sun btn-sm"
                    >
                      <RollText text={block.ctaLabel} />
                      <PiArrowUpRight aria-hidden="true" />
                    </a>
                  ) : (
                    <Link to={block.ctaUrl} className="btn btn-sun btn-sm">
                      <RollText text={block.ctaLabel} />
                      <PiArrowRight aria-hidden="true" />
                    </Link>
                  ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default CustomBlocks;
