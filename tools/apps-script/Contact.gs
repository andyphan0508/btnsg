/**
 * BTNSG — Google Apps Script Web App: Nhận Lời nhắn / Đăng ký từ Landing Page
 * và tự động gửi mail về hộp thư banthanhniensaigon@gmail.com
 *
 * Cách triển khai (xem chi tiết trong DEPLOY.md):
 * 1. Vào https://script.google.com → New project, dán toàn bộ file này vào Code.gs.
 * 2. Deploy → New deployment → bánh răng ⚙ → Web app:
 *      - Execute as: Me (tài khoản Gmail của bạn)
 *      - Who has access: Anyone
 * 3. Copy URL dạng https://script.google.com/macros/s/AKfyc.../exec
 *    → dán vào biến VITE_CONTACT_SCRIPT_URL trong file .env của landing app.
 */

var TARGET_EMAIL = 'banthanhniensaigon@gmail.com';

function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : '';
    var data = {};
    if (contents) {
      try {
        data = JSON.parse(contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }

    var name = String(data.name || '').trim();
    var contact = String(data.contact || data.email || '').trim();
    var message = String(data.message || '').trim();

    if (!name || !contact || !message) {
      return jsonResponse_({ ok: false, error: 'Vui lòng điền đầy đủ họ tên, thông tin liên hệ và lời nhắn.' });
    }

    var subject = '[BTNSG Website] Lời nhắn mới từ: ' + name;
    var bodyText =
      'Bạn vừa nhận được một lời nhắn mới từ website Ban Thanh Niên HTTL Sài Gòn:\n\n' +
      '• Họ và tên: ' + name + '\n' +
      '• Liên hệ (Email/SĐT): ' + contact + '\n' +
      '• Thời gian: ' + new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) + '\n\n' +
      'Nội dung lời nhắn:\n' + message + '\n\n' +
      '---\n' +
      'Email tự động gửi từ Web App Ban Thanh Niên HTTL Sài Gòn';

    var htmlBody =
      '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background-color: #ffffff;">' +
      '<h2 style="color: #e2693e; margin-top: 0;">💬 Lời nhắn mới từ Website BTNSG</h2>' +
      '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">' +
      '<tr><td style="padding: 8px 0; color: #64748b; width: 120px;">Họ và tên:</td><td style="padding: 8px 0; font-weight: bold; color: #0f172a;">' + escapeHtml_(name) + '</td></tr>' +
      '<tr><td style="padding: 8px 0; color: #64748b;">Liên hệ:</td><td style="padding: 8px 0; font-weight: bold; color: #2563eb;">' + escapeHtml_(contact) + '</td></tr>' +
      '<tr><td style="padding: 8px 0; color: #64748b;">Thời gian:</td><td style="padding: 8px 0; color: #475569;">' + new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) + '</td></tr>' +
      '</table>' +
      '<div style="background-color: #f8fafc; border-left: 4px solid #e2693e; padding: 16px; border-radius: 4px; font-size: 15px; color: #1e293b; white-space: pre-wrap;">' +
      escapeHtml_(message) +
      '</div>' +
      '</div>';

    GmailApp.sendEmail(TARGET_EMAIL, subject, bodyText, {
      name: 'Website BTNSG Contact Form',
      htmlBody: htmlBody,
    });

    return jsonResponse_({ ok: true, message: 'Đã gửi lời nhắn thành công!' });
  } catch (err) {
    return jsonResponse_({ ok: false, error: 'Không thể gửi email: ' + String(err) });
  }
}

function doGet() {
  return jsonResponse_({ ok: true, message: 'BTNSG Contact Webhook đang hoạt động. Gửi POST để liên hệ.' });
}

function escapeHtml_(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
