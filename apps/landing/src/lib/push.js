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

  if (!response.ok) {
    const detail = await response.json().catch(() => null)
    return { ok: false, reason: detail?.error || `HTTP ${response.status}` }
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
