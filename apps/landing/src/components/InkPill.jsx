/** Ảnh nhỏ bo tròn chèn ngay giữa dòng tiêu đề lớn (trang trí, không đọc bởi trình đọc màn hình). */
export default function InkPill({ src, position = "50% 50%", size = "cover", className = "" }) {
  return (
    <span
      className={`ink-pill ${className}`}
      aria-hidden="true"
      style={{ backgroundImage: `url(${src})`, backgroundPosition: position, backgroundSize: size }}
    />
  );
}
