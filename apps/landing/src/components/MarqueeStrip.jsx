import { PiSparkleFill } from "react-icons/pi";

/**
 * Băng chữ chạy vô tận. Mỗi hàng là một dải: hàng lẻ bằng kính, hàng chẵn màu nắng chạy ngược,
 * hai dải bắt chéo nhau. Nội dung lặp 4 lần để vòng lặp -50% không bao giờ hở mép màn hình.
 */
export default function MarqueeStrip({ rows }) {
  return (
    <div className={`marquee${rows.length === 1 ? " is-single" : ""}`} aria-hidden="true">
      {rows.map((items, r) => (
        <div className={`marquee-tape ${r % 2 ? "is-sun" : "is-glass"}`} key={r}>
          <div className={`marquee-track${r % 2 ? " is-reverse" : ""}`}>
            {[...items, ...items, ...items, ...items].map((item, i) => (
              <span className="marquee-item" key={i}>
                {item}
                <PiSparkleFill className="marquee-star" />
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
