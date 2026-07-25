/**
 * BTNSG — Web App cấp dữ liệu Thư viện ảnh cho trang landing.
 *
 * PHIÊN BẢN ĐƠN GIẢN: toàn bộ ảnh nằm trực tiếp trong MỘT folder duy nhất
 * (không chia album). Web hiển thị thành một lưới ảnh + slider trang chủ.
 *
 * Cách triển khai (xem chi tiết trong DEPLOY.md):
 * 1. Chia sẻ folder ảnh: chuột phải → Share → "Anyone with the link" → Viewer.
 *    (Ảnh phải công khai thì trình duyệt khách mới hiển thị được.)
 * 2. Lấy FOLDER ID từ URL https://drive.google.com/drive/folders/<ID_NAY>
 *    → dán vào FOLDER_ID bên dưới.
 * 3. https://script.google.com → New project, dán toàn bộ file này vào Code.gs.
 * 4. Chạy hàm doGet 1 lần để cấp quyền đọc Drive (Review permissions → Allow).
 * 5. Deploy → New deployment → bánh răng ⚙ → Web app:
 *      Execute as: Me · Who has access: Anyone → Deploy.
 * 6. Copy WEB APP URL (dạng .../macros/s/AKfycb.../exec — KHÔNG phải Library URL)
 *    → đặt vào biến VITE_GALLERY_SCRIPT_URL của landing.
 *
 * ⚠️ MỖI LẦN SỬA FILE NÀY (kể cả đổi FOLDER_ID) phải:
 *    Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.
 *    Nếu không, URL /exec vẫn chạy BẢN CŨ.
 *
 * API (GET):
 *   <URL>/exec              → { folder: "Tên folder", images: [{ id, name }] }
 *   <URL>/exec?refresh=1    → như trên nhưng bỏ qua cache (vừa thêm/xoá ảnh)
 *   <URL>/exec?debug=1      → thông tin chẩn đoán (tên folder, số ảnh, vài tên file đầu)
 * Trình duyệt tự dựng link ảnh: https://drive.google.com/thumbnail?id=<ID>&sz=w1600
 */

// DÁN FOLDER ID CỦA FOLDER CHỨA ẢNH VÀO ĐÂY.
var FOLDER_ID = 'DAN_FOLDER_ID_VAO_DAY';

// Thời gian cache (giây) để đỡ đọc Drive mỗi lần tải trang.
var CACHE_SECONDS = 600; // 10 phút

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    if (params.debug === '1') {
      return jsonResponse_(debugInfo_());
    }
    return jsonResponse_(listImages_(params));
  } catch (err) {
    return jsonResponse_({ error: String(err) });
  }
}

/** Toàn bộ ảnh nằm trực tiếp trong folder, sắp theo tên. Hỗ trợ phân trang tùy chọn. */
function listImages_(params) {
  var skipCache = params.refresh === '1';
  var page = parseInt(params.page, 10) || 0;
  var pageSize = parseInt(params.pageSize, 10) || 0;

  var cache = CacheService.getScriptCache();
  var rawData = null;

  if (!skipCache) {
    var cached = cache.get('images');
    if (cached) rawData = JSON.parse(cached);
  }

  if (!rawData) {
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var files = folder.getFiles();
    var images = [];
    while (files.hasNext()) {
      var file = files.next();
      if (isImage_(file)) {
        images.push({ id: file.getId(), name: file.getName() });
      }
    }
    images.sort(function (a, b) {
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });

    rawData = { folder: folder.getName(), images: images, total: images.length };

    // Không cache kết quả rỗng — tránh "đóng băng" trạng thái sai khi đang cấu hình.
    if (images.length > 0) {
      cachePutSafe_(cache, 'images', JSON.stringify(rawData));
    }
  }

  // Nếu không truyền page/pageSize → trả về toàn bộ ảnh (tương thích ngược 100%)
  if (page <= 0 || pageSize <= 0) {
    return rawData;
  }

  var startIndex = (page - 1) * pageSize;
  var pagedImages = rawData.images.slice(startIndex, startIndex + pageSize);

  return {
    folder: rawData.folder,
    total: rawData.images.length,
    page: page,
    pageSize: pageSize,
    totalPages: Math.ceil(rawData.images.length / pageSize),
    images: pagedImages
  };
}

/** ?debug=1 — xem script đang thấy gì trong folder. */
function debugInfo_() {
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var files = folder.getFiles();
  var imageCount = 0;
  var otherCount = 0;
  var sampleNames = [];
  while (files.hasNext()) {
    var file = files.next();
    if (isImage_(file)) {
      imageCount++;
      if (sampleNames.length < 10) sampleNames.push(file.getName());
    } else {
      otherCount++;
    }
  }

  var subfolderNames = [];
  var subs = folder.getFolders();
  while (subs.hasNext()) {
    subfolderNames.push(subs.next().getName());
  }

  return {
    folderId: FOLDER_ID,
    folderName: folder.getName(),
    imageCount: imageCount,
    nonImageFiles: otherCount,
    subfolders: subfolderNames,
    sampleImages: sampleNames,
    note: 'Script chỉ đọc ảnh nằm TRỰC TIẾP trong folder này. Ảnh trong subfolder sẽ KHÔNG hiển thị — nếu subfolders ở trên có chứa ảnh, hãy kéo ảnh ra folder chính.',
  };
}

function isImage_(file) {
  return String(file.getMimeType()).indexOf('image/') === 0;
}

/** CacheService giới hạn ~100KB/khóa — quá lớn thì bỏ cache, không làm vỡ API. */
function cachePutSafe_(cache, key, value) {
  try {
    cache.put(key, value, CACHE_SECONDS);
  } catch (ignored) {
    // Không cache được thì mỗi lần đọc trực tiếp Drive — chậm hơn nhưng vẫn đúng.
  }
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
