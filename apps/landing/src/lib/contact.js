// Helper gọi Google Apps Script Webhook để gửi lời nhắn tới banthanhniensaigon@gmail.com

const CONTACT_URL = import.meta.env.VITE_CONTACT_SCRIPT_URL || ''

export const isContactConfigured = Boolean(CONTACT_URL)

/**
 * Gửi lời nhắn / đăng ký tham gia tới email Ban Thanh Niên
 * @param {{ name: string, contact: string, message: string }} payload
 */
export async function sendContactMessage(payload) {
  if (!CONTACT_URL) {
    // Mô phỏng thành công khi chưa dán VITE_CONTACT_SCRIPT_URL
    await new Promise((resolve) => setTimeout(resolve, 800))
    return { ok: true, demo: true, message: 'Đã nhận lời nhắn mẫu (Chưa dán VITE_CONTACT_SCRIPT_URL).' }
  }

  // Dùng Content-Type text/plain để tránh CORS preflight với Apps Script
  const response = await fetch(CONTACT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`Không kết nối được với máy chủ (HTTP ${response.status}).`)
  }

  const text = await response.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Máy chủ phản hồi không đúng định dạng JSON.')
  }

  if (data && !data.ok) {
    throw new Error(data.error || 'Gửi tin nhắn không thành công.')
  }

  return data
}
