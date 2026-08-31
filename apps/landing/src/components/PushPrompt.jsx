import { useEffect, useState } from "react";
import {
  BellOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "motion/react";
import {
  getPermission,
  hasActiveSubscription,
  isPushConfigured,
  isPushSupported,
  needsIosHomeScreenInstall,
  subscribeToPush,
} from "../lib/push.js";

const STORAGE_KEY = "btnsg-push-prompt";
const SNOOZE_DAYS = 7;
const SHOW_DELAY_MS = 4000;

const isSnoozed = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { dismissedAt } = JSON.parse(raw);
    if (!dismissedAt) return false;
    return Date.now() - dismissedAt < SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

const snooze = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissedAt: Date.now() }));
  } catch {}
};

export default function PushPrompt() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [iosNeedsInstall] = useState(needsIosHomeScreenInstall);

  useEffect(() => {
    if (!isPushConfigured) return undefined;
    if (isSnoozed()) return undefined;

    if (iosNeedsInstall) {
      const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
      return () => clearTimeout(timer);
    }

    if (!isPushSupported()) return undefined;
    if (getPermission() !== "default") return undefined;

    let cancelled = false;
    hasActiveSubscription().then((active) => {
      if (active || cancelled) return;
      const timer = setTimeout(() => {
        if (!cancelled) setVisible(true);
      }, SHOW_DELAY_MS);
      return () => clearTimeout(timer);
    });

    return () => {
      cancelled = true;
    };
  }, [iosNeedsInstall]);

  const handleAccept = async () => {
    setStatus("working");
    setError(null);
    try {
      const result = await subscribeToPush();
      if (result.ok) {
        setStatus("done");
        setTimeout(() => setVisible(false), 2600);
      } else {
        setStatus("error");
        setError(
          result.reason === "denied"
            ? "Bạn đã chặn thông báo. Có thể bật lại trong cài đặt trình duyệt."
            : result.reason === "not-configured"
              ? "Website chưa bật tính năng thông báo."
              : result.reason || "Chưa đăng ký được, vui lòng thử lại sau.",
        );
        if (result.reason === "denied") setTimeout(() => setVisible(false), 3200);
      }
    } catch (err) {
      setStatus("error");
      setError(err.message || "Chưa đăng ký được, vui lòng thử lại sau.");
    }
  };

  const handleDismiss = () => {
    snooze();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="push-prompt"
          role="dialog"
          aria-label="Nhận thông báo từ Ban Thanh Niên"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed",
            bottom: 24,
            left: 24,
            maxWidth: 380,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)",
            padding: 20,
            boxShadow: "var(--shadow-lg)",
            zIndex: 999,
          }}
        >
          <button
            onClick={handleDismiss}
            type="button"
            aria-label="Đóng"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "transparent",
              border: "none",
              color: "var(--ink-3)",
              cursor: "pointer",
            }}
          >
            <CloseOutlined style={{ fontSize: 14 }} />
          </button>

          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "var(--radius-md)",
                background: "var(--brand-light)",
                color: "var(--brand)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                fontSize: 18,
              }}
            >
              {status === "done" ? <CheckCircleOutlined /> : <BellOutlined />}
            </div>

            <div style={{ flex: 1 }}>
              {iosNeedsInstall ? (
                <>
                  <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--ink)", marginBottom: 4 }}>
                    Theo dõi Ban Thanh Niên?
                  </strong>
                  <p style={{ fontSize: "0.84rem", color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 12 }}>
                    Trên iPhone/iPad, hãy <strong>thêm trang này vào Màn hình chính</strong> trước —
                    bấm nút <ShareAltOutlined /> <strong>Chia sẻ</strong> → chọn <strong>"Thêm vào MH chính"</strong>.
                  </p>
                  <button className="btn btn-gold" onClick={handleDismiss} type="button" style={{ padding: "6px 14px", fontSize: "0.82rem" }}>
                    Đã hiểu
                  </button>
                </>
              ) : status === "done" ? (
                <>
                  <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--ink)", marginBottom: 4 }}>
                    Đã bật thông báo 🎉
                  </strong>
                  <p style={{ fontSize: "0.84rem", color: "var(--ink-2)" }}>Bạn sẽ nhận được tin mới và nhắc lịch sinh hoạt.</p>
                </>
              ) : (
                <>
                  <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--ink)", marginBottom: 4 }}>
                    Theo dõi Ban Thanh Niên?
                  </strong>
                  <p style={{ fontSize: "0.84rem", color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 12 }}>
                    Nhận thông báo khi có tin tức mới và nhắc lịch sinh hoạt sắp tới.
                  </p>
                  {error && <p style={{ fontSize: "0.8rem", color: "#ef4444", marginBottom: 8 }}>{error}</p>}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-gold"
                      onClick={handleAccept}
                      disabled={status === "working"}
                      type="button"
                      style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                    >
                      {status === "working" ? "Đang bật…" : "Nhận thông báo"}
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={handleDismiss}
                      type="button"
                      style={{ padding: "6px 12px", fontSize: "0.82rem" }}
                    >
                      Để sau
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
