// Nội dung landing chỉnh từ dashboard (màn hình "Website" → bảng site_content).
// index.html bắt đầu tải /api/site-content song song với bundle JS; main.jsx chờ bước
// loadSiteContent() rồi mới vẽ, nên trang hiện ngay nội dung mới — không nháy nội dung cũ.
// Lỗi mạng / chạy dev không có API → bản cache lần trước → giá trị mặc định (@btnsg/shared).

import { useSyncExternalStore } from "react";
import { mergeSiteContent, toSiteImageUrl } from "@btnsg/shared";
import groupPhoto from "../assets/background.webp";

const CACHE_KEY = "btnsg-site-content";
/** Lượt đầu (chưa có bản lưu trên máy): chờ API tối đa bấy nhiêu ms rồi vẽ bằng mặc định. */
const FIRST_VISIT_WAIT_MS = 1500;

/** Nội dung đang hiển thị — component đọc trực tiếp `content.<mục>.<ô>` khi render. */
export const content = mergeSiteContent({});

let version = 0;
const listeners = new Set();

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY));
  } catch {
    return null;
  }
};

const writeCache = (saved) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(saved));
  } catch {
    // localStorage đầy/bị chặn → chỉ mất tối ưu lần sau.
  }
};

export function applySiteContent(saved) {
  Object.assign(content, mergeSiteContent(saved));
  document.title = content.general.seoTitle;
  document.querySelector('meta[name="description"]')?.setAttribute("content", content.general.seoDescription);
  version += 1;
  listeners.forEach((notify) => notify());
}

/** Gọi ở App: nội dung đổi (xem trước từ dashboard) → cả cây vẽ lại. */
export function useSiteContent() {
  useSyncExternalStore(
    (notify) => {
      listeners.add(notify);
      return () => listeners.delete(notify);
    },
    () => version,
  );
  return content;
}

/** Bản mới đến sau khi trang đã vẽ → cập nhật nếu khác (không đè bản nháp đang xem trước). */
const applyIfChanged = (fresh, shown) => {
  if (fresh && !isPreview && JSON.stringify(fresh) !== JSON.stringify(shown)) applySiteContent(fresh);
};

/** Đọc nhanh bản cache từ lần trước (đồng bộ) để vẽ khung hình đầu tiên ngay lập tức. */
export function hydrateCachedSiteContent() {
  const cached = readCache();
  if (cached) applySiteContent(cached);
  return cached;
}

export async function loadSiteContent() {
  const cached = readCache();
  const request = (window.__siteContent ?? Promise.resolve(null)).then((payload) => {
    if (payload?.content && Object.keys(payload.content).length > 0) writeCache(payload.content);
    return payload?.content ?? null;
  });

  if (cached) {
    request.then((fresh) => applyIfChanged(fresh, cached));
    return;
  }

  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), FIRST_VISIT_WAIT_MS));
  const fresh = await Promise.race([request, timeout]);
  if (fresh && Object.keys(fresh).length > 0) applySiteContent(fresh);
  else request.then((late) => late && Object.keys(late).length > 0 && applyIfChanged(late, null));
}

/* ---------- Xem trước trực tiếp trong khung iframe của dashboard ---------- */

// Chỉ nhận bản nháp từ đúng origin của dashboard — trang khác nhúng iframe không giả được nội dung.
const ADMIN_ORIGINS = (
  import.meta.env.VITE_ADMIN_ORIGIN || "https://quanly-btnsg.vercel.app,https://btnsg-dashboard.pages.dev"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean)
  .concat(import.meta.env.DEV ? ["http://localhost:5174"] : []);

export const isPreview = new URLSearchParams(window.location.search).has("preview") && window.parent !== window;

export function listenForPreview() {
  if (!isPreview) return;
  window.addEventListener("message", (event) => {
    if (!ADMIN_ORIGINS.includes(event.origin) || event.data?.type !== "btnsg:preview") return;
    applySiteContent(event.data.content);
  });
  // Báo dashboard: trang đã sẵn sàng nhận bản nháp (gửi tới origin lạ thì trình duyệt tự bỏ).
  ADMIN_ORIGINS.forEach((origin) => window.parent.postMessage({ type: "btnsg:ready" }, origin));
}

/** Ảnh nhóm ở Hero / viên ảnh {anh}: ảnh chọn trong dashboard, trống thì ảnh mặc định. */
export const heroImage = () => toSiteImageUrl(content.hero.image) || groupPhoto;
