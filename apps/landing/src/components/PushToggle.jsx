import { useEffect, useState } from "react";
import { FiBell, FiBellOff } from "react-icons/fi";
import {
  getPermission,
  hasActiveSubscription,
  isPushConfigured,
  isPushSupported,
  registerServiceWorker,
  subscribeToPush,
  unsubscribeFromPush,
} from "../lib/push.js";

/** iOS chỉ cho nhận thông báo khi web đã được thêm vào Màn hình chính. */
const isIosSafari = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !window.matchMedia("(display-mode: standalone)").matches &&
  !window.navigator.standalone;

/**
 * Nút bật/tắt nhận thông báo — đặt ở footer để người đã đăng ký
 * (hoặc đã lỡ bấm "Để sau") luôn có chỗ thay đổi lựa chọn.
 */
export default function PushToggle() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [permission, setPermissionState] = useState("default");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!isPushConfigured || !isPushSupported()) return;
    setSupported(true);
    setPermissionState(getPermission());
    // Đăng ký lại service worker mỗi lần tải trang cho chắc (idempotent),
    // phòng trường hợp người dùng đã xoá dữ liệu duyệt web.
    registerServiceWorker().catch(() => {});
    hasActiveSubscription().then(setSubscribed);
  }, []);

  if (!supported) return null;

  const handleToggle = async () => {
    setBusy(true);
    setMessage(null);
    try {
      if (subscribed) {
        await unsubscribeFromPush();
        setSubscribed(false);
        setMessage("Đã tắt thông báo.");
      } else {
        if (isIosSafari()) {
          setMessage(
            'Trên iPhone/iPad: bấm nút Chia sẻ → "Thêm vào MH chính", mở web từ biểu tượng đó rồi bật lại.',
          );
          setBusy(false);
          return;
        }
        const result = await subscribeToPush();
        if (result.ok) {
          setSubscribed(true);
          setMessage("Đã bật thông báo 🎉");
        } else if (result.reason === "denied") {
          setPermissionState("denied");
          setMessage("Bạn đã chặn thông báo — hãy bật lại trong cài đặt trình duyệt.");
        } else {
          setMessage("Chưa bật được, vui lòng thử lại sau.");
        }
      }
    } catch {
      setMessage("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setBusy(false);
      setTimeout(() => setMessage(null), 6000);
    }
  };

  return (
    <div className="push-toggle">
      <button
        type="button"
        className={`push-toggle-btn${subscribed ? " on" : ""}`}
        onClick={handleToggle}
        disabled={busy || permission === "denied"}
        title={
          permission === "denied"
            ? "Thông báo đang bị chặn trong cài đặt trình duyệt"
            : subscribed
              ? "Tắt nhận thông báo"
              : "Bật nhận thông báo tin tức & lịch sinh hoạt"
        }
      >
        {subscribed ? <FiBell size={15} /> : <FiBellOff size={15} />}
        <span>
          {busy
            ? "Đang xử lý…"
            : permission === "denied"
              ? "Thông báo đang bị chặn"
              : subscribed
                ? "Đang nhận thông báo"
                : "Nhận thông báo"}
        </span>
      </button>
      {message && <span className="push-toggle-msg">{message}</span>}
    </div>
  );
}
