import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ClipboardEvent, type MutableRefObject } from 'react';
import {
  FiAlignCenter,
  FiAlignJustify,
  FiAlignLeft,
  FiAlignRight,
  FiBold,
  FiCode,
  FiEye,
  FiImage,
  FiItalic,
  FiLink,
  FiList,
  FiMinus,
  FiRotateCcw,
  FiRotateCw,
  FiTrash2,
  FiUnderline,
} from 'react-icons/fi';
import { isHtmlContent, sanitizeRichHtml, stripHtmlToText } from '@btnsg/shared';
import Modal from './Modal';

export type RichEditorImageAlign = 'center' | 'full' | 'left' | 'right';

export type RichEditorApi = {
  insertImage: (url: string, alt?: string, caption?: string, align?: RichEditorImageAlign, imgName?: string) => void;
};

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  postImages?: { name: string; url: string }[];
  onUploadImages?: (files: FileList) => Promise<{ name: string; url: string }[]>;
  onOpenMomentsPicker?: () => void;
  editorApiRef?: MutableRefObject<RichEditorApi | null>;
};

type EditorMode = 'visual' | 'html' | 'preview';

const FONT_OPTIONS = [
  { label: 'Mặc định (Sans)', value: "'Be Vietnam Pro', system-ui, sans-serif" },
  { label: 'Báo chí (Lora Serif)', value: "'Lora', Georgia, serif" },
  { label: 'Hiện đại (Geist)', value: "'Geist', system-ui, sans-serif" },
  { label: 'Mã nguồn (Mono)', value: 'ui-monospace, Consolas, monospace' },
];

const SIZE_OPTIONS = [
  { label: 'Nhỏ (14px)', value: '14px' },
  { label: 'Chuẩn (16px)', value: '16px' },
  { label: 'Vừa (18px)', value: '18px' },
  { label: 'Lớn (22px)', value: '22px' },
  { label: 'Rất lớn (28px)', value: '28px' },
];

const COLOR_OPTIONS = [
  { label: 'Mặc định', value: '#231b15' },
  { label: 'Cam đất (BTNSG)', value: '#d96236' },
  { label: 'Vàng hổ phách', value: '#c4882a' },
  { label: 'Nâu trầm', value: '#5c4033' },
  { label: 'Xanh lá', value: '#2f6846' },
  { label: 'Xanh dương', value: '#1f5c8a' },
  { label: 'Đỏ nổi bật', value: '#b42318' },
  { label: 'Xám ghi chú', value: '#62564b' },
];

const escapeAttr = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Bắt đầu viết nội dung bài viết tại đây…',
  minHeight = 420,
  postImages = [],
  onUploadImages,
  onOpenMomentsPicker,
  editorApiRef,
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef<string>('');
  const savedRangeRef = useRef<Range | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<EditorMode>('visual');
  const [blockTag, setBlockTag] = useState<string>('P');
  const [fontFamily, setFontFamily] = useState<string>(FONT_OPTIONS[0].value);
  const [fontSize, setFontSize] = useState<string>('16px');
  const [textColor, setTextColor] = useState<string>(COLOR_OPTIONS[0].value);

  // Link modal
  const [isLinkOpen, setIsLinkOpen] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>('https://');
  const [linkText, setLinkText] = useState<string>('');

  // Image modal
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [imgUrl, setImgUrl] = useState<string>('');
  const [imgName, setImgName] = useState<string>('');
  const [imgAlt, setImgAlt] = useState<string>('');
  const [imgCaption, setImgCaption] = useState<string>('');
  const [imgAlign, setImgAlign] = useState<RichEditorImageAlign>('center');
  const [isUploadingImg, setIsUploadingImg] = useState<boolean>(false);

  // Đồng bộ giá trị từ props vào contentEditable CHỈ khi thay đổi từ bên ngoài (không làm nhảy con trỏ khi gõ).
  useEffect(() => {
    if (mode !== 'visual') return;
    const el = editorRef.current;
    if (!el) return;
    if (value !== lastHtmlRef.current) {
      el.innerHTML = value || '';
      lastHtmlRef.current = value || '';
    }
  }, [value, mode]);

  const emitHtml = () => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    lastHtmlRef.current = html;
    onChange(html);
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (editorRef.current?.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (!sel) return;
    if (savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  const runCommand = (cmd: string, arg?: string) => {
    restoreSelection();
    document.execCommand(cmd, false, arg);
    emitHtml();
  };

  const applyInlineStyle = (styleProp: 'fontFamily' | 'fontSize' | 'color', styleValue: string) => {
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    if (range.collapsed) {
      // Nếu chưa bôi đen, áp dụng cho khối hiện tại hoặc tạo span tại chỗ
      const span = document.createElement('span');
      span.style[styleProp] = styleValue;
      span.appendChild(document.createTextNode('\u200B'));
      range.insertNode(span);
      const nextRange = document.createRange();
      nextRange.setStart(span.firstChild!, 1);
      nextRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(nextRange);
    } else {
      const span = document.createElement('span');
      span.style[styleProp] = styleValue;
      try {
        range.surroundContents(span);
      } catch {
        const frag = range.extractContents();
        span.appendChild(frag);
        range.insertNode(span);
      }
      sel.removeAllRanges();
      const nextRange = document.createRange();
      nextRange.selectNodeContents(span);
      sel.addRange(nextRange);
    }
    emitHtml();
  };

  const insertHtmlAtCursor = (html: string) => {
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      document.execCommand('insertHTML', false, html);
    } else if (editorRef.current) {
      editorRef.current.insertAdjacentHTML('beforeend', html);
    }
    emitHtml();
  };

  const insertImageBlock = (
    url: string,
    alt = '',
    caption = '',
    align: RichEditorImageAlign = 'center',
    nameAttr = '',
  ) => {
    if (!url) return;
    const safeUrl = escapeAttr(url);
    const safeAlt = escapeAttr(alt);
    const namePart = nameAttr ? ` data-img-name="${escapeAttr(nameAttr)}"` : '';
    const capPart = caption.trim() ? `<figcaption>${escapeAttr(caption.trim())}</figcaption>` : '';
    const html = `<figure class="rte-figure align-${align}"><img src="${safeUrl}" alt="${safeAlt}"${namePart} />${capPart}</figure><p><br /></p>`;
    insertHtmlAtCursor(html);
  };

  useEffect(() => {
    if (!editorApiRef) return;
    editorApiRef.current = {
      insertImage: insertImageBlock,
    };
    return () => {
      editorApiRef.current = null;
    };
  });

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const htmlData = event.clipboardData?.getData('text/html');
    if (htmlData) {
      event.preventDefault();
      const cleaned = sanitizeRichHtml(htmlData);
      document.execCommand('insertHTML', false, cleaned);
      emitHtml();
    }
  };

  const openLinkModal = () => {
    saveSelection();
    const sel = window.getSelection();
    setLinkText(sel?.toString() ?? '');
    setLinkUrl('https://');
    setIsLinkOpen(true);
  };

  const handleInsertLink = () => {
    const href = linkUrl.trim();
    if (!href || !/^(https?:\/\/|mailto:|tel:|\/)/i.test(href)) return;
    const label = (linkText.trim() || href).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    setIsLinkOpen(false);
    insertHtmlAtCursor(`<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`);
  };

  const openImageModal = () => {
    saveSelection();
    setImgUrl('');
    setImgName('');
    setImgAlt('');
    setImgCaption('');
    setImgAlign('center');
    setIsImageOpen(true);
  };

  const handleUploadInsideModal = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!onUploadImages || !event.target.files?.length) return;
    try {
      setIsUploadingImg(true);
      const uploaded = await onUploadImages(event.target.files);
      if (uploaded[0]) {
        setImgUrl(uploaded[0].url);
        setImgName(uploaded[0].name);
        if (!imgAlt) setImgAlt(uploaded[0].name.replace(/\.[^/.]+$/, ''));
      }
    } finally {
      setIsUploadingImg(false);
      event.target.value = '';
    }
  };

  const handleConfirmImage = () => {
    if (!imgUrl.trim()) return;
    setIsImageOpen(false);
    insertImageBlock(imgUrl.trim(), imgAlt, imgCaption, imgAlign, imgName);
  };

  const stats = useMemo(() => {
    const plain = stripHtmlToText(value);
    const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
    const minutes = Math.max(1, Math.round(words / 200));
    return { words, minutes };
  }, [value]);

  const previewHtml = useMemo(() => sanitizeRichHtml(value), [value]);

  return (
    <div className="rte-shell">
      {/* Thanh đầu: chuyển chế độ Trực quan / HTML / Xem trước */}
      <div className="rte-head">
        <div className="segmented" role="tablist" aria-label="Chế độ soạn thảo">
          <button type="button" className={mode === 'visual' ? 'active' : undefined} onClick={() => setMode('visual')}>
            Trực quan
          </button>
          <button type="button" className={mode === 'html' ? 'active' : undefined} onClick={() => setMode('html')}>
            <FiCode style={{ verticalAlign: '-2px', marginRight: 4 }} />
            HTML
          </button>
          <button type="button" className={mode === 'preview' ? 'active' : undefined} onClick={() => setMode('preview')}>
            <FiEye style={{ verticalAlign: '-2px', marginRight: 4 }} />
            Xem trước
          </button>
        </div>

        <span className="rte-stats">
          {stats.words} từ · ~{stats.minutes} phút đọc
        </span>
      </div>

      {/* Thanh công cụ kiểu WordPress */}
      {mode === 'visual' && (
        <div className="rte-toolbar" onMouseDown={(e) => { if ((e.target as HTMLElement).tagName !== 'SELECT') e.preventDefault(); }}>
          <select
            className="rte-select"
            aria-label="Kiểu đoạn văn"
            value={blockTag}
            onChange={(e) => {
              const tag = e.target.value;
              setBlockTag(tag);
              runCommand('formatBlock', tag === 'BLOCKQUOTE' ? 'BLOCKQUOTE' : `<${tag}>`);
            }}
          >
            <option value="P">Đoạn văn</option>
            <option value="H2">Tiêu đề lớn (H2)</option>
            <option value="H3">Tiêu đề vừa (H3)</option>
            <option value="H4">Tiêu đề nhỏ (H4)</option>
            <option value="BLOCKQUOTE">Trích dẫn</option>
          </select>

          <select
            className="rte-select"
            aria-label="Phông chữ"
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value);
              applyInlineStyle('fontFamily', e.target.value);
            }}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          <select
            className="rte-select"
            aria-label="Cỡ chữ"
            value={fontSize}
            onChange={(e) => {
              setFontSize(e.target.value);
              applyInlineStyle('fontSize', e.target.value);
            }}
          >
            {SIZE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            className="rte-select"
            aria-label="Màu chữ"
            value={textColor}
            onChange={(e) => {
              setTextColor(e.target.value);
              applyInlineStyle('color', e.target.value);
            }}
          >
            {COLOR_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                Màu: {c.label}
              </option>
            ))}
          </select>

          <span className="rte-sep" />

          <button type="button" className="rte-btn" title="In đậm (Ctrl+B)" onClick={() => runCommand('bold')}>
            <FiBold />
          </button>
          <button type="button" className="rte-btn" title="In nghiêng (Ctrl+I)" onClick={() => runCommand('italic')}>
            <FiItalic />
          </button>
          <button type="button" className="rte-btn" title="Gạch chân (Ctrl+U)" onClick={() => runCommand('underline')}>
            <FiUnderline />
          </button>
          <button type="button" className="rte-btn" title="Gạch ngang" onClick={() => runCommand('strikeThrough')}>
            <span style={{ textDecoration: 'line-through', fontWeight: 700, fontSize: '0.82rem' }}>S</span>
          </button>

          <span className="rte-sep" />

          <button type="button" className="rte-btn" title="Căn trái" onClick={() => runCommand('justifyLeft')}>
            <FiAlignLeft />
          </button>
          <button type="button" className="rte-btn" title="Căn giữa" onClick={() => runCommand('justifyCenter')}>
            <FiAlignCenter />
          </button>
          <button type="button" className="rte-btn" title="Căn phải" onClick={() => runCommand('justifyRight')}>
            <FiAlignRight />
          </button>
          <button type="button" className="rte-btn" title="Căn đều" onClick={() => runCommand('justifyFull')}>
            <FiAlignJustify />
          </button>

          <span className="rte-sep" />

          <button type="button" className="rte-btn" title="Danh sách dấu chấm" onClick={() => runCommand('insertUnorderedList')}>
            <FiList />
          </button>
          <button type="button" className="rte-btn" title="Danh sách đánh số" onClick={() => runCommand('insertOrderedList')}>
            <span style={{ fontWeight: 700, fontSize: '0.78rem' }}>1.</span>
          </button>
          <button type="button" className="rte-btn" title="Đường kẻ phân cách" onClick={() => runCommand('insertHorizontalRule')}>
            <FiMinus />
          </button>

          <span className="rte-sep" />

          <button type="button" className="rte-btn" title="Chèn liên kết" onClick={openLinkModal}>
            <FiLink />
          </button>
          <button type="button" className="rte-btn" title="Chèn hình ảnh" onClick={openImageModal}>
            <FiImage />
          </button>
          {onOpenMomentsPicker && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => { saveSelection(); onOpenMomentsPicker(); }}>
              + Từ Khoảnh khắc
            </button>
          )}

          <span className="rte-sep" />

          <button type="button" className="rte-btn" title="Xóa định dạng" onClick={() => runCommand('removeFormat')}>
            <FiTrash2 />
          </button>
          <button type="button" className="rte-btn" title="Hoàn tác" onClick={() => runCommand('undo')}>
            <FiRotateCcw />
          </button>
          <button type="button" className="rte-btn" title="Làm lại" onClick={() => runCommand('redo')}>
            <FiRotateCw />
          </button>
        </div>
      )}

      {/* Vùng soạn thảo */}
      {mode === 'visual' && (
        <div
          ref={editorRef}
          className="rte-canvas rich-content"
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          style={{ minHeight }}
          onInput={emitHtml}
          onBlur={saveSelection}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onPaste={handlePaste}
        />
      )}

      {mode === 'html' && (
        <textarea
          className="rte-html-area"
          style={{ minHeight }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<p>Nhập mã HTML tại đây…</p>"
        />
      )}

      {mode === 'preview' && (
        <div className="rte-preview rich-content" style={{ minHeight }}>
          {isHtmlContent(value) ? (
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          ) : (
            <p className="cell-muted">Chưa có nội dung để xem trước.</p>
          )}
        </div>
      )}

      {/* Modal chèn liên kết */}
      <Modal
        size="sm"
        isOpen={isLinkOpen}
        title="Chèn liên kết"
        onClose={() => setIsLinkOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-outline" onClick={() => setIsLinkOpen(false)}>
              Hủy
            </button>
            <button type="button" className="btn btn-primary" onClick={handleInsertLink}>
              Chèn liên kết
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field" style={{ margin: 0 }}>
            <label className="field-label">Văn bản hiển thị</label>
            <input
              className="input"
              value={linkText}
              placeholder="VD: Xem lịch sinh hoạt"
              onChange={(e) => setLinkText(e.target.value)}
            />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label className="field-label">Đường dẫn (URL)</label>
            <input
              className="input"
              value={linkUrl}
              placeholder="https://..."
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Modal chèn hình ảnh & bố cục ảnh kiểu WordPress */}
      <Modal
        size="md"
        isOpen={isImageOpen}
        title="Chèn hình ảnh vào bài viết"
        onClose={() => setIsImageOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-outline" onClick={() => setIsImageOpen(false)}>
              Hủy
            </button>
            <button type="button" className="btn btn-primary" disabled={!imgUrl.trim() || isUploadingImg} onClick={handleConfirmImage}>
              Chèn ảnh
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {onUploadImages && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleUploadInsideModal}
              />
              <button
                type="button"
                className="btn btn-outline"
                disabled={isUploadingImg}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploadingImg ? 'Đang tải ảnh lên…' : '+ Tải ảnh từ thiết bị'}
              </button>
            </div>
          )}

          {postImages.length > 0 && (
            <div>
              <div className="field-label" style={{ marginBottom: 6 }}>Hoặc chọn nhanh ảnh đã đính kèm trong bài:</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {postImages.map((img) => (
                  <button
                    key={img.url}
                    type="button"
                    className={`rte-pick-thumb${imgUrl === img.url ? ' is-selected' : ''}`}
                    onClick={() => {
                      setImgUrl(img.url);
                      setImgName(img.name);
                      if (!imgAlt) setImgAlt(img.name.replace(/\.[^/.]+$/, ''));
                    }}
                  >
                    <img src={img.url} alt={img.name} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="field" style={{ margin: 0 }}>
            <label className="field-label">Đường dẫn ảnh (URL)</label>
            <input
              className="input"
              value={imgUrl}
              placeholder="https://..."
              onChange={(e) => setImgUrl(e.target.value)}
            />
          </div>

          <div className="form-grid">
            <div className="field" style={{ margin: 0 }}>
              <label className="field-label">Chú thích dưới ảnh</label>
              <input
                className="input"
                value={imgCaption}
                placeholder="VD: Toàn thể Ban Thanh Niên"
                onChange={(e) => setImgCaption(e.target.value)}
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label className="field-label">Bố cục hiển thị</label>
              <select className="select" value={imgAlign} onChange={(e) => setImgAlign(e.target.value as RichEditorImageAlign)}>
                <option value="center">Căn giữa (chuẩn)</option>
                <option value="full">Toàn chiều rộng bài</option>
                <option value="left">Nằm bên trái chữ</option>
                <option value="right">Nằm bên phải chữ</option>
              </select>
            </div>
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label className="field-label">Mô tả ảnh (Alt SEO)</label>
            <input
              className="input"
              value={imgAlt}
              placeholder="Mô tả ngắn nội dung ảnh"
              onChange={(e) => setImgAlt(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RichTextEditor;
