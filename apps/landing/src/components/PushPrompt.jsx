import { useEffect, useState } from "react";
import { PiBellRinging, PiCheckCircle, PiExport, PiX } from "react-icons/pi";
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
    let timer;
    hasActiveSubscription().then((active) => {
      if (active || cancelled) return;
      timer = setTimeout(() => {
        if (!cancelled) setVisible(true);
      }, SHOW_DELAY_MS);
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
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
          className="push-prompt glass is-solid"
          role="dialog"
          aria-label="Nhận thông báo từ Ban Thanh Niên"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <button onClick={handleDismiss} type="button" aria-label="Đóng" className="push-close">
            <PiX />
          </button>

          <span className="icon-tile">{status === "done" ? <PiCheckCircle /> : <PiBellRinging />}</span>

          <div>
            {iosNeedsInstall ? (
              <>
                <strong className="push-title">Theo dõi Ban Thanh Niên?</strong>
                <p className="push-text">
                  Trên iPhone/iPad, hãy <strong>thêm trang này vào Màn hình chính</strong> trước — bấm
                  nút <PiExport aria-hidden="true" /> <strong>Chia sẻ</strong> → chọn{" "}
                  <strong>"Thêm vào MH chính"</strong>.
                </p>
                <div className="push-actions">
                  <button className="btn btn-sun btn-sm" onClick={handleDismiss} type="button">
                    Đã hiểu
                  </button>
                </div>
              </>
            ) : status === "done" ? (
              <>
                <strong className="push-title">Đã bật thông báo</strong>
                <p className="push-text">Bạn sẽ nhận được tin mới và nhắc lịch sinh hoạt.</p>
              </>
            ) : (
              <>
                <strong className="push-title">Theo dõi Ban Thanh Niên?</strong>
                <p className="push-text">
                  Nhận thông báo khi có tin tức mới và nhắc lịch sinh hoạt sắp tới.
                </p>
                {error && <p className="push-error">{error}</p>}
                <div className="push-actions">
                  <button
                    className="btn btn-sun btn-sm"
                    onClick={handleAccept}
                    disabled={status === "working"}
                    type="button"
                  >
                    {status === "working" ? "Đang bật…" : "Nhận thông báo"}
                  </button>
                  <button className="btn btn-glass btn-sm" onClick={handleDismiss} type="button">
                    Để sau
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
