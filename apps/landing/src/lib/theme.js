import { useEffect, useState } from "react";

// Theme ban đầu được đặt bởi script nhỏ trong index.html (trước khi vẽ trang, không nháy).
const EVENT = "themechange";

const currentTheme = () =>
  document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";

/** [theme, toggle] — Nav và BottomNav dùng chung, luôn đồng bộ với nhau. */
export function useTheme() {
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    const sync = () => setTheme(currentTheme());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const toggle = () => {
    const next = currentTheme() === "light" ? "dark" : "light";
    const apply = () => {
      document.documentElement.setAttribute("data-theme", next);
      window.dispatchEvent(new Event(EVENT));
    };
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Chặn lưu trữ → vẫn đổi theme trong phiên này.
    }
    // Chuyển sáng/tối bằng hiệu ứng hoà trộn nếu trình duyệt hỗ trợ View Transitions.
    if (document.startViewTransition) document.startViewTransition(apply);
    else apply();
  };

  return [theme, toggle];
}
