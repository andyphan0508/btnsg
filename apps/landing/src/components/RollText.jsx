/**
 * RollText: Hiệu ứng chạy chữ / cuộn lật 2 tầng phong cách Aardvark Book Club.
 * Được tinh chỉnh chiều cao (1.45em) để bảo toàn tuyệt đối 100% dấu thanh tiếng Việt (mũ, móc, hỏi, ngã, sắc, nặng).
 */
export default function RollText({ text, className = "" }) {
  if (!text) return null;

  return (
    <span className={`roll-text ${className}`} data-text={text}>
      <span className="roll-text-inner">{text}</span>
    </span>
  );
}
