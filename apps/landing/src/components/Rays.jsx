const RAYS = Array.from({ length: 24 }, (_, i) => i);

/** Vầng tia sáng cam/vàng xen kẽ — lấy từ những tia nắng trong biểu trưng Ban Thanh Niên. */
export default function Rays({ className = "" }) {
  return (
    <svg className={`rays ${className}`} viewBox="-100 -100 200 200" aria-hidden="true">
      {RAYS.map((i) => {
        const long = i % 2 === 0;
        const tip = long ? 98 : 88;
        return (
          <path
            key={i}
            className={long ? "ray-a" : "ray-b"}
            d={`M-1.7 -64 L1.7 -64 L${long ? 3.6 : 3} -${tip} L-${long ? 3.6 : 3} -${tip} Z`}
            transform={`rotate(${i * 15})`}
          />
        );
      })}
    </svg>
  );
}
