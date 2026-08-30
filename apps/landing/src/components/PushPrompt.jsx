import { useEffect, useState } from "react";
import { FiBell, FiX, FiCheckCircle, FiShare } from "react-icons/fi";
import {
  getPermission,
  hasActiveSubscription,
  isPushConfigured,
  isPushSupported,
  needsIosHomeScreenInstall,
  subscribeToPush,
} from "../lib/push.js";

const STORAGE_KEY = "btnsg-push-prompt";
/** Bấm "Để sau" thì 7 ngày sau mới hỏi lại — không làm phiền người xem. */
const SNOOZE_DAYS = 7;
/** Chờ vài giây cho người xem kịp đọc trang rồi mới mời. */
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
  } catch {
    /* chế độ riêng tư chặn localStorage — bỏ qua, chỉ là ghi nhớ tiện ích */
  }
};

/**
 * Lời mời nhận thông báo về tin tức & lịch sinh hoạt.
 * Chỉ gọi Notification.requestPermission khi người dùng bấm nút — trình duyệt
 * chặn (và người dùng ghét) việc hỏi ngay lúc vừa vào trang.
 */
export default function PushPrompt() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | working | done | error
  const [error, setError] = useState(null);
  // iOS (Safari/Chrome…) chỉ cho phép Web Push khi trang đã "Thêm vào Màn hình chính" —
  // trong trình duyệt thường thì bấm "Nhận thông báo" sẽ không có hộp thoại nào hiện ra cả.
  // Ghi nhớ một lần lúc mount, không đổi trong lúc trang đang mở.
  const [iosNeedsInstall] = useState(needsIosHomeScreenInstall);

  useEffect(() => {
    if (!isPushConfigured) return undefined;
    if (isSnoozed()) return undefined;

    // Trên iOS ngoài Màn hình chính: luôn hiện hướng dẫn cài đặt, kể cả khi trình duyệt
    // có vẻ hỗ trợ Web Push về mặt kỹ thuật — vì thực tế vẫn không xin quyền được.
    if (iosNeedsInstall) {
      const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
      return () => clearTimeout(timer);
    }

    if (!isPushSupported()) return undefined;
    // Đã cho phép / đã chặn → không mời nữa.
    if (getPermission() !== "default") return undefined;

    let cancelled = false;
    hasActiveSubscription().then((active) => {
      if (active || cancelled) return;
      const timer = setTimeout(() => {
        if (!cancelled) setVisible(true);
      }, SHOW_DELAY_MS);
      // Dọn timer nếu component bị gỡ trước khi hiện
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
              // Hiện đúng lý do từ máy chủ để còn biết đường sửa
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

  if (!visible) return null;

  return (
    <div className="push-prompt" role="dialog" aria-label="Nhận thông báo từ Ban Thanh Niên">
      <button className="push-close" onClick={handleDismiss} type="button" aria-label="Đóng">
        <FiX size={16} />
      </button>

      <div className="push-icon">
        {status === "done" ? <FiCheckCircle size={20} /> : <FiBell size={20} />}
      </div>

      <div className="push-body">
        {iosNeedsInstall ? (
          <>
            <strong>Theo dõi Ban Thanh Niên?</strong>
            <p>
              Trên iPhone/iPad, hãy <strong>thêm trang này vào Màn hình chính</strong> trước —
              bấm nút <FiShare size={13} style={{ verticalAlign: "-2px" }} /> <strong>Chia sẻ</strong> ở
              thanh trình duyệt → chọn <strong>"Thêm vào MH chính"</strong>. Sau đó mở lại web từ
              biểu tượng vừa thêm để bật thông báo.
            </p>
            <div className="push-actions">
              <button className="btn btn-gold push-accept" onClick={handleDismiss} type="button">
                Đã hiểu
              </button>
            </div>
          </>
        ) : status === "done" ? (
          <>
            <strong>Đã bật thông báo 🎉</strong>
            <p>Bạn sẽ nhận được tin mới và nhắc lịch sinh hoạt của Ban.</p>
          </>
        ) : (
          <>
            <strong>Theo dõi Ban Thanh Niên?</strong>
            <p>
              Nhận thông báo khi có tin tức mới và nhắc lịch sinh hoạt sắp tới. Bạn có thể tắt
              bất cứ lúc nào.
            </p>
            {error && <p className="push-error">{error}</p>}
            <div className="push-actions">
              <button
                className="btn btn-gold push-accept"
                onClick={handleAccept}
                disabled={status === "working"}
                type="button"
              >
                {status === "working" ? "Đang bật…" : "Nhận thông báo"}
              </button>
              <button className="btn btn-ghost push-later" onClick={handleDismiss} type="button">
                Để sau
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
