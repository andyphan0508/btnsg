/**
 * BTNSG — Web App gửi email hàng loạt cho Ban Điều Hành.
 *
 * Cách triển khai (xem chi tiết trong DEPLOY.md ở repo):
 * 1. Vào https://script.google.com → New project, dán toàn bộ file này vào Code.gs.
 * 2. Sửa SHARED_SECRET bên dưới thành một chuỗi bí mật của riêng bạn.
 * 3. Deploy → New deployment → Web app:
 *      - Execute as: Me (email của bạn — email gửi đi sẽ từ tài khoản này)
 *      - Who has access: Anyone
 * 4. Copy URL dạng https://script.google.com/macros/s/AKfyc.../exec
 *    → đặt vào biến môi trường VITE_APPS_SCRIPT_URL của dashboard (kèm ?secret=...).
 *
 * Dashboard sẽ POST JSON (Content-Type: text/plain để tránh CORS preflight):
 * {
 *   "subject": "Tiêu đề",
 *   "body": "Nội dung thuần văn bản, có thể chứa {{ten_nguoi_nhan}}",
 *   "recipients": [{ "name": "Nguyễn Văn A", "email": "a@example.com" }]
 * }
 */

// ĐỔI CHUỖI NÀY trước khi deploy — phải trùng với ?secret= trong VITE_APPS_SCRIPT_URL.
var SHARED_SECRET = 'doi-chuoi-bi-mat-nay';

// Tên hiển thị của người gửi.
var SENDER_NAME = 'Ban Thanh Niên HTTL Sài Gòn';

function doPost(e) {
  var output;
  try {
    var secret = (e && e.parameter && e.parameter.secret) || '';
    if (secret !== SHARED_SECRET) {
      return jsonResponse_({ ok: false, sent: 0, error: 'Sai secret — kiểm tra VITE_APPS_SCRIPT_URL.' });
    }

    var payload = JSON.parse(e.postData.contents);
    var subject = String(payload.subject || '').trim();
    var body = String(payload.body || '');
    var recipients = payload.recipients || [];

    if (!subject || !body || recipients.length === 0) {
      return jsonResponse_({ ok: false, sent: 0, error: 'Thiếu subject/body/recipients.' });
    }
    if (recipients.length > 50) {
      return jsonResponse_({ ok: false, sent: 0, error: 'Tối đa 50 người nhận mỗi lần gửi.' });
    }

    var sent = 0;
    var failures = [];
    recipients.forEach(function (recipient) {
      var email = String(recipient.email || '').trim();
      var name = String(recipient.name || '').trim();
      if (!email) return;
      try {
        var personalBody = body.replace(/\{\{\s*ten_nguoi_nhan\s*\}\}/g, name || 'anh chị em');
        var personalSubject = subject.replace(/\{\{\s*ten_nguoi_nhan\s*\}\}/g, name || 'anh chị em');
        GmailApp.sendEmail(email, personalSubject, personalBody, {
          name: SENDER_NAME,
          htmlBody: textToHtml_(personalBody),
        });
        sent++;
      } catch (err) {
        failures.push(email + ': ' + err);
      }
    });

    output = { ok: sent > 0, sent: sent };
    if (failures.length > 0) output.error = 'Một số email lỗi: ' + failures.join('; ');
    return jsonResponse_(output);
  } catch (err) {
    return jsonResponse_({ ok: false, sent: 0, error: String(err) });
  }
}

/** Cho phép mở URL bằng trình duyệt để kiểm tra web app còn sống. */
function doGet() {
  return jsonResponse_({ ok: true, sent: 0, error: 'BTNSG mail webhook đang hoạt động. Dùng POST để gửi email.' });
}

function textToHtml_(text) {
  var escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap;">' +
    escaped +
    '</div>';
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
