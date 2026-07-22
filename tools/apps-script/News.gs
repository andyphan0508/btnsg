/**
 * BTNSG — Web App cấp dữ liệu TIN TỨC cho trang landing (kiểu "WordPress mini").
 *
 * MÔ HÌNH: MỘT folder Google Drive "Tin tức", trong đó MỖI BÀI VIẾT LÀ MỘT FOLDER CON:
 *
 *   📁 Tin tức
 *   ├── 📁 Trại hè 2026
 *   │   ├── 📄 bai-viet.md        ← nội dung bài (Markdown, tên file tuỳ ý, đuôi .md)
 *   │   ├── 🖼️ cover.jpg          ← ảnh bìa (headline picture)
 *   │   └── 🖼️ sinh-hoat-1.jpg    ← ảnh chèn trong bài: ![Chú thích](sinh-hoat-1.jpg)
 *   └── 📁 Thông báo tháng 8
 *       └── ...
 *
 * File .md có thể mở đầu bằng frontmatter (không bắt buộc — thiếu gì script tự suy ra):
 *
 *   ---
 *   title: Trại hè Thanh Niên 2026
 *   date: 2026-07-20
 *   description: Tóm tắt ngắn hiện ở trang danh sách tin.
 *   cover: cover.jpg
 *   ---
 *   Nội dung Markdown bắt đầu từ đây...
 *
 * Suy ra khi thiếu: title = tên folder bài viết; date = ngày tạo file .md;
 * description = đoạn văn đầu tiên; cover = ảnh tên "cover.*" hoặc ảnh đầu tiên (theo tên).
 *
 * Cách triển khai (giống Gallery.gs — xem DEPLOY.md Bước 2c):
 * 1. Share folder "Tin tức": Anyone with the link → Viewer (để trình duyệt tải được ảnh).
 * 2. Lấy FOLDER ID từ URL https://drive.google.com/drive/folders/<ID_NAY> → dán vào NEWS_FOLDER_ID.
 * 3. https://script.google.com → New project, dán toàn bộ file này vào Code.gs.
 * 4. Chạy hàm doGet 1 lần để cấp quyền đọc Drive (Review permissions → Allow).
 * 5. Deploy → New deployment → ⚙ → Web app: Execute as Me · Who has access: Anyone.
 * 6. Copy WEB APP URL (.../exec) → đặt vào biến VITE_NEWS_SCRIPT_URL của landing.
 *
 * ⚠️ MỖI LẦN SỬA FILE NÀY phải Deploy → Manage deployments → ✏️ → New version → Deploy.
 *
 * API (GET):
 *   <URL>/exec                 → { folder, posts: [{ id, title, date, description, cover }] } (mới → cũ)
 *   <URL>/exec?post=<id>       → { id, title, date, description, cover, content, images: [{id,name}] }
 *   <URL>/exec?refresh=1       → bỏ qua cache (dùng sau khi vừa thêm/sửa bài)
 *   <URL>/exec?debug=1         → thông tin chẩn đoán từng bài
 * Ảnh hiển thị qua: https://drive.google.com/thumbnail?id=<ID>&sz=w1600
 */

// DÁN FOLDER ID CỦA FOLDER "TIN TỨC" VÀO ĐÂY.
var NEWS_FOLDER_ID = 'DAN_FOLDER_ID_VAO_DAY';

// ĐỔI CHUỖI NÀY trước khi deploy — dashboard đăng bài phải gửi kèm ?secret= trùng khớp.
// (GET đọc tin tức vẫn công khai, không cần secret — chỉ THAO TÁC GHI mới cần.)
var SHARED_SECRET = 'doi-chuoi-bi-mat-nay';

// Thời gian cache (giây) để đỡ đọc Drive mỗi lần tải trang.
// Để dài hơn chu kỳ trigger warmCache (10 phút) — trigger ghi đè cache đều đặn
// nên dữ liệu vẫn mới trong ~10 phút, còn cache thì không bao giờ nguội.
var CACHE_SECONDS = 1800; // 30 phút

/**
 * HÂM NÓNG CACHE — chạy định kỳ để không người xem nào phải chờ đọc Drive.
 *
 * Cài đặt (1 lần, trong editor Apps Script):
 *   Triggers (⏰ bên trái) → Add Trigger →
 *     Function: warmCache · Event source: Time-driven ·
 *     Type: Minutes timer · Every 10 minutes → Save.
 *
 * Từ đó: cache luôn ấm (web tải nhanh với mọi người xem) và bài mới đăng
 * tự xuất hiện trong tối đa ~10 phút, không cần ai mở ?refresh=1 nữa.
 */
function warmCache() {
  var list = listPosts_(true); // đọc Drive thật + ghi đè cache danh sách
  for (var i = 0; i < list.posts.length; i++) {
    try {
      getPost_(list.posts[i].id, true); // hâm nóng luôn từng bài chi tiết
    } catch (ignored) {
      // 1 bài lỗi (VD vừa bị xoá) không nên làm hỏng cả lượt hâm nóng.
    }
  }
}

/**
 * DASHBOARD ĐĂNG BÀI — doPost nhận JSON (Content-Type: text/plain để né CORS preflight),
 * xác thực bằng ?secret=. Các action:
 *   { action: "create-post", title, date, description, markdown, cover? } → { ok, id }
 *   { action: "upload-image", postId, name, mimeType, dataBase64 }        → { ok, imageId }
 *   { action: "update-post", postId, title, date, description, markdown, cover? } → { ok }
 *   { action: "delete-post", postId }                                     → { ok } (chuyển vào thùng rác)
 *   { action: "warm" }                                                    → { ok } (hâm nóng cache)
 */
function doPost(e) {
  try {
    var secret = (e && e.parameter && e.parameter.secret) || '';
    if (secret !== SHARED_SECRET) {
      return jsonResponse_({ ok: false, error: 'Sai secret — kiểm tra VITE_NEWS_SCRIPT_URL của dashboard (phải kèm ?secret=...).' });
    }
    var payload = JSON.parse(e.postData.contents);
    var action = String(payload.action || '');
    if (action === 'create-post') return jsonResponse_(createPost_(payload));
    if (action === 'update-post') return jsonResponse_(updatePost_(payload));
    if (action === 'upload-image') return jsonResponse_(uploadImage_(payload));
    if (action === 'delete-post') return jsonResponse_(deletePost_(payload));
    if (action === 'warm') {
      warmCache();
      return jsonResponse_({ ok: true });
    }
    return jsonResponse_({ ok: false, error: 'action không hợp lệ: ' + action });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

/** Tạo folder bài viết mới + ghi content.md. */
function createPost_(payload) {
  var title = String(payload.title || '').trim();
  var markdown = String(payload.markdown || '').trim();
  if (!title) return { ok: false, error: 'Thiếu tiêu đề bài viết.' };
  if (!markdown) return { ok: false, error: 'Thiếu nội dung bài viết.' };

  var root = DriveApp.getFolderById(NEWS_FOLDER_ID);
  var folder = root.createFolder(title);
  folder.createFile('content.md', buildMarkdownFile_(payload), 'text/markdown');
  invalidateCache_(folder.getId());
  return { ok: true, id: folder.getId() };
}

/** Ghi đè content.md của bài viết có sẵn (giữ nguyên ảnh trong folder). */
function updatePost_(payload) {
  var title = String(payload.title || '').trim();
  var markdown = String(payload.markdown || '').trim();
  if (!title) return { ok: false, error: 'Thiếu tiêu đề bài viết.' };
  if (!markdown) return { ok: false, error: 'Thiếu nội dung bài viết.' };

  var folder = getPostFolderChecked_(payload.postId);
  var mdFile = findMarkdownFile_(folder);
  if (mdFile) {
    mdFile.setContent(buildMarkdownFile_(payload));
  } else {
    folder.createFile('content.md', buildMarkdownFile_(payload), 'text/markdown');
  }
  if (folder.getName() !== title) folder.setName(title);
  invalidateCache_(folder.getId());
  return { ok: true };
}

/** Lưu 1 ảnh (base64) vào folder bài viết. */
function uploadImage_(payload) {
  var name = String(payload.name || '').trim();
  var dataBase64 = String(payload.dataBase64 || '');
  if (!name || !dataBase64) return { ok: false, error: 'Thiếu tên file hoặc dữ liệu ảnh.' };

  var folder = getPostFolderChecked_(payload.postId);
  var bytes = Utilities.base64Decode(dataBase64);
  var blob = Utilities.newBlob(bytes, String(payload.mimeType || 'image/jpeg'), name);
  var file = folder.createFile(blob);
  invalidateCache_(folder.getId());
  return { ok: true, imageId: file.getId() };
}

/** Chuyển folder bài viết vào thùng rác (khôi phục được trong 30 ngày trên Drive). */
function deletePost_(payload) {
  var folder = getPostFolderChecked_(payload.postId);
  folder.setTrashed(true);
  invalidateCache_(String(payload.postId));
  return { ok: true };
}

/** Ghép frontmatter + nội dung thành file .md hoàn chỉnh. */
function buildMarkdownFile_(payload) {
  var lines = ['---'];
  lines.push('title: ' + oneLine_(payload.title));
  var date = normalizeDate_(payload.date);
  if (date) lines.push('date: ' + date);
  var description = oneLine_(payload.description);
  if (description) lines.push('description: ' + description);
  var cover = oneLine_(payload.cover);
  if (cover) lines.push('cover: ' + cover);
  lines.push('---');
  return lines.join('\n') + '\n\n' + String(payload.markdown || '').trim() + '\n';
}

/** Ép về 1 dòng để không phá cấu trúc frontmatter. */
function oneLine_(value) {
  return String(value || '').replace(/\s*\n\s*/g, ' ').trim();
}

/** Chỉ cho phép thao tác lên folder con TRỰC TIẾP của folder Tin Tức (an toàn). */
function getPostFolderChecked_(postFolderId) {
  var id = String(postFolderId || '').trim();
  if (!id) throw new Error('Thiếu postId.');
  var folder = DriveApp.getFolderById(id);
  var parents = folder.getParents();
  while (parents.hasNext()) {
    if (parents.next().getId() === NEWS_FOLDER_ID) return folder;
  }
  throw new Error('Folder này không nằm trong thư mục Tin Tức — từ chối thao tác.');
}

function findMarkdownFile_(folder) {
  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    if (isMarkdown_(file)) return file;
  }
  return null;
}

/** Xoá cache sau khi ghi để lượt đọc kế tiếp thấy dữ liệu mới ngay. */
function invalidateCache_(postFolderId) {
  var cache = CacheService.getScriptCache();
  cache.remove('news:list');
  if (postFolderId) cache.remove('news:post:' + postFolderId);
}

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    if (params.debug === '1') {
      return jsonResponse_(debugInfo_());
    }
    if (params.post) {
      return jsonResponse_(getPost_(params.post, params.refresh === '1'));
    }
    return jsonResponse_(listPosts_(params.refresh === '1'));
  } catch (err) {
    return jsonResponse_({ error: String(err) });
  }
}

/** Danh sách bài viết (không kèm nội dung Markdown), sắp theo ngày mới → cũ. */
function listPosts_(skipCache) {
  var cache = CacheService.getScriptCache();
  if (!skipCache) {
    var cached = cache.get('news:list');
    if (cached) return JSON.parse(cached);
  }

  var root = DriveApp.getFolderById(NEWS_FOLDER_ID);
  var subs = root.getFolders();
  var posts = [];
  while (subs.hasNext()) {
    var post = readPost_(subs.next(), false);
    if (post) posts.push(post);
  }
  posts.sort(function (a, b) {
    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  });

  var result = { folder: root.getName(), posts: posts };
  if (posts.length > 0) {
    cachePutSafe_(cache, 'news:list', JSON.stringify(result));
  }
  return result;
}

/** Một bài viết đầy đủ (kèm nội dung Markdown + danh sách ảnh của bài). */
function getPost_(postFolderId, skipCache) {
  var cache = CacheService.getScriptCache();
  var cacheKey = 'news:post:' + postFolderId;
  if (!skipCache) {
    var cached = cache.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  var folder = DriveApp.getFolderById(postFolderId);
  var post = readPost_(folder, true);
  if (!post) throw new Error('Folder này không có file .md nào — không phải folder bài viết.');

  cachePutSafe_(cache, cacheKey, JSON.stringify(post));
  return post;
}

/**
 * Đọc 1 folder bài viết → object bài viết, hoặc null nếu folder không có file .md.
 * includeContent=false: chỉ metadata (cho trang danh sách, nhẹ hơn).
 */
function readPost_(folder, includeContent) {
  var files = folder.getFiles();
  var mdFile = null;
  var images = [];
  while (files.hasNext()) {
    var file = files.next();
    if (isMarkdown_(file)) {
      if (!mdFile) mdFile = file;
    } else if (isImage_(file)) {
      images.push({ id: file.getId(), name: file.getName() });
    }
  }
  if (!mdFile) return null;

  images.sort(function (a, b) {
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });

  var raw = mdFile.getBlob().getDataAsString('UTF-8');
  var parsed = parseFrontmatter_(raw);
  var meta = parsed.meta;

  var post = {
    id: folder.getId(),
    title: meta.title || folder.getName(),
    date: normalizeDate_(meta.date) || isoDate_(mdFile.getDateCreated()),
    description: meta.description || firstParagraph_(parsed.content),
    cover: findCoverId_(images, meta.cover),
  };
  if (includeContent) {
    post.content = parsed.content;
    post.images = images;
  }
  return post;
}

/** Tách frontmatter `--- ... ---` (nếu có) khỏi nội dung Markdown. */
function parseFrontmatter_(raw) {
  var text = raw.replace(/^﻿/, ''); // bỏ BOM nếu file lưu từ Windows
  var meta = {};
  var match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { meta: meta, content: text.trim() };

  var lines = match[1].split('\n');
  for (var i = 0; i < lines.length; i++) {
    var idx = lines[i].indexOf(':');
    if (idx === -1) continue;
    var key = lines[i].slice(0, idx).trim().toLowerCase();
    var value = lines[i].slice(idx + 1).trim();
    if (key && value) meta[key] = value;
  }
  return { meta: meta, content: text.slice(match[0].length).trim() };
}

/** Đoạn văn đầu tiên của bài → description khi frontmatter không ghi. */
function firstParagraph_(content) {
  var blocks = content.split(/\n\s*\n/);
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i].trim();
    if (!block) continue;
    if (/^(#|!\[|>|```|-|\*|\d+\.)/.test(block)) continue; // bỏ heading/ảnh/quote/list
    var plain = block.replace(/\*\*|\*|`|\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ');
    return plain.length > 180 ? plain.slice(0, 177) + '…' : plain;
  }
  return '';
}

/** Ảnh bìa: frontmatter `cover:` → ảnh tên "cover.*" → ảnh đầu tiên. Trả về file ID. */
function findCoverId_(images, coverName) {
  if (images.length === 0) return '';
  if (coverName) {
    for (var i = 0; i < images.length; i++) {
      if (images[i].name.toLowerCase() === String(coverName).toLowerCase()) return images[i].id;
    }
  }
  for (var j = 0; j < images.length; j++) {
    if (/^cover\./i.test(images[j].name)) return images[j].id;
  }
  return images[0].id;
}

/** Chuẩn hoá ngày về yyyy-mm-dd; chấp nhận cả dd/mm/yyyy. Sai định dạng → ''. */
function normalizeDate_(value) {
  if (!value) return '';
  var iso = String(value).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return iso[1] + '-' + pad2_(iso[2]) + '-' + pad2_(iso[3]);
  var vn = String(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (vn) return vn[3] + '-' + pad2_(vn[2]) + '-' + pad2_(vn[1]);
  return '';
}

function isoDate_(date) {
  return Utilities.formatDate(date, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
}

function pad2_(n) {
  return ('0' + n).slice(-2);
}

/** ?debug=1 — xem script đang thấy gì trong folder tin tức. */
function debugInfo_() {
  var root = DriveApp.getFolderById(NEWS_FOLDER_ID);
  var subs = root.getFolders();
  var postsInfo = [];
  while (subs.hasNext()) {
    var folder = subs.next();
    var files = folder.getFiles();
    var mdName = null;
    var imageCount = 0;
    var otherCount = 0;
    while (files.hasNext()) {
      var file = files.next();
      if (isMarkdown_(file)) {
        if (!mdName) mdName = file.getName();
      } else if (isImage_(file)) {
        imageCount++;
      } else {
        otherCount++;
      }
    }
    postsInfo.push({
      folderName: folder.getName(),
      folderId: folder.getId(),
      mdFile: mdName || '(THIẾU file .md — bài này sẽ KHÔNG hiển thị)',
      imageCount: imageCount,
      otherFiles: otherCount,
    });
  }

  var looseFiles = 0;
  var rootFiles = root.getFiles();
  while (rootFiles.hasNext()) {
    rootFiles.next();
    looseFiles++;
  }

  return {
    folderId: NEWS_FOLDER_ID,
    folderName: root.getName(),
    postCount: postsInfo.length,
    posts: postsInfo,
    looseFilesInRoot: looseFiles,
    note: 'Mỗi bài viết = 1 folder con chứa 1 file .md + ảnh. File nằm rời ngoài folder gốc sẽ bị bỏ qua.',
  };
}

function isMarkdown_(file) {
  return /\.md$/i.test(file.getName());
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
