// Đăng ký nhận thông báo đẩy (Web Push) cho trang landing.
// Luồng: đăng ký service worker → xin quyền → tạo subscription → gửi về server lưu lại.

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

/** Đã cấu hình khoá VAPID thì mới bật tính năng thông báo. */
export const isPushConfigured = Boolean(VAPID_PUBLIC_KEY)

/** Trình duyệt có đủ khả năng nhận Web Push không. */
export const isPushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window

/** iPhone/iPad/iPod — áp dụng cho mọi trình duyệt trên iOS (Safari, Chrome…), vì
 * tất cả đều dùng chung engine WebKit và chung giới hạn Web Push của Apple. */
export const isIos = () => {
  if (typeof navigator === 'undefined') return false
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return true
  // Từ iPadOS 13, Safari giả User-Agent giống macOS — phân biệt bằng cảm ứng đa điểm
  // (máy Mac thật không có màn hình cảm ứng).
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

/** Web đang chạy ở chế độ đã "Thêm vào Màn hình chính" (PWA standalone). */
export const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true)

/** iOS chỉ cho nhận Web Push khi trang đã được thêm vào Màn hình chính (mọi trình duyệt). */
export const needsIosHomeScreenInstall = () => isIos() && !isStandalone()

/** 'default' (chưa hỏi) | 'granted' | 'denied' | 'unsupported' */
export const getPermission = () => {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}

/** Khoá VAPID dạng base64url → Uint8Array cho PushManager. */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)))
}

/** Đăng ký service worker (idempotent — gọi nhiều lần vẫn an toàn). */
export async function registerServiceWorker() {
  if (!isPushSupported()) return null
  return navigator.serviceWorker.register('/sw.js')
}

/**
 * Xin quyền và đăng ký nhận thông báo.
 * PHẢI được gọi từ một thao tác của người dùng (bấm nút) — trình duyệt
 * chặn requestPermission tự động khi vừa tải trang.
 * Trả về { ok: true } hoặc { ok: false, reason }.
 */
export async function subscribeToPush() {
  if (!isPushSupported()) return { ok: false, reason: 'unsupported' }
  if (!isPushConfigured) return { ok: false, reason: 'not-configured' }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { ok: false, reason: permission }

  const registration = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  // Đã đăng ký trước đó thì dùng lại, tránh tạo endpoint trùng.
  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
  }

  const response = await fetch('/api/push-subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      userAgent: navigator.userAgent,
    }),
  })

  // Khi chạy `npm run dev` (Vite), thư mục api/ không hoạt động — máy chủ trả về
  // index.html kèm status 200. Không kiểm tra thì sẽ báo "thành công" nhầm.
  const raw = await response.text()
  let payload = null
  try {
    payload = JSON.parse(raw)
  } catch {
    return {
      ok: false,
      reason:
        'Máy chủ không trả về dữ liệu hợp lệ. Chức năng thông báo chỉ chạy trên bản đã deploy (Vercel), không chạy với `npm run dev`.',
    }
  }

  if (!response.ok || !payload?.ok) {
    // Đăng ký ở trình duyệt đã tạo nhưng server không lưu được → gỡ ra cho sạch,
    // tránh trạng thái "máy nghĩ là đã đăng ký" mà thực tế server không biết.
    await subscription.unsubscribe().catch(() => {})
    return { ok: false, reason: payload?.error || `HTTP ${response.status}` }
  }

  return { ok: true }
}

/** Huỷ nhận thông báo trên thiết bị này. */
export async function unsubscribeFromPush() {
  if (!isPushSupported()) return false
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  if (!subscription) return false

  await fetch('/api/push-subscribe', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  }).catch(() => {})

  return subscription.unsubscribe()
}

/** Thiết bị này đã đăng ký nhận thông báo chưa. */
export async function hasActiveSubscription() {
  if (!isPushSupported() || Notification.permission !== 'granted') return false
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  return Boolean(subscription)
}
