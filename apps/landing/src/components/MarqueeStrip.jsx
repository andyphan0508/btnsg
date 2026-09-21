/**
 * MarqueeStrip: Dải băng chạy chữ liên tục (Ticker Tape) phong cách Aardvark Book Club.
 * Tự động chạy chữ mượt mà, khi hover chuột vào có thể tạm dừng hoặc chạy tốc độ khác.
 */
export default function MarqueeStrip() {
  const ITEMS = [
    "Ban Thanh Niên HTTL Sài Gòn",
    "Từ năm 1942",
    "Thờ phượng Chúa Nhật 14:30",
    "Tất cả vì người chưa được cứu",
    "155 Trần Hưng Đạo, Q.1",
    "Kết nối & Trưởng thành đức tin",
    "Môn đồ Chúa Cứu Thế"
  ];

  return (
    <div className="marquee-strip" aria-hidden="true">
      <div className="marquee-track">
        {ITEMS.concat(ITEMS)
          .concat(ITEMS)
          .map((item, idx) => (
            <span className="marquee-item" key={`${item}-${idx}`}>
              <span>{item}</span>
              <span className="marquee-dot" />
            </span>
          ))}
      </div>
    </div>
  );
}
