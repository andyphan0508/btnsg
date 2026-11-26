/**
 * Tiện ích xử lý nội dung Rich Text (HTML kiểu WordPress) & tương thích ngược với Markdown cũ.
 * Dùng chung cho cả Dashboard (soạn thảo + xem trước) và Landing (hiển thị).
 */

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'div',
  'span',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'del',
  'h1',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'hr',
  'a',
  'img',
  'figure',
  'figcaption',
  'sub',
  'sup',
]);

const STRIP_WITH_CONTENT_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'textarea',
  'button',
  'svg',
  'math',
]);

const ALLOWED_STYLE_PROPS = new Set([
  'font-family',
  'font-size',
  'text-align',
  'color',
  'background-color',
  'width',
  'max-width',
  'line-height',
  'margin',
  'margin-left',
  'margin-right',
  'float',
  'border-radius',
]);

const SAFE_LINK_HREF = /^(https?:\/\/|mailto:|tel:|\/)/i;
const SAFE_IMG_SRC = /^(https?:\/\/|blob:|data:image\/|\/)/i;
const SAFE_CLASS = /^[a-z0-9 _-]+$/i;
const UNSAFE_CSS_VALUE = /(url\s*\(|expression\s*\(|javascript:|@import)/i;

/** Kiểm tra chuỗi nội dung là HTML (từ Rich Text Editor) hay Markdown cũ. */
export const isHtmlContent = (content: string): boolean => {
  const trimmed = (content ?? '').trim();
  if (!trimmed) return false;
  if (/^<(p|div|h[1-6]|ul|ol|blockquote|figure|pre|hr|img|table|section|article|span|strong|em|b|i|u|s|a)\b/i.test(trimmed)) {
    return true;
  }
  return /<\/(p|div|h[1-6]|ul|ol|blockquote|figure|li)>/i.test(trimmed);
};

const filterStyle = (rawStyle: string): string => {
  const kept: string[] = [];
  for (const part of rawStyle.split(';')) {
    const colonIdx = part.indexOf(':');
    if (colonIdx === -1) continue;
    const prop = part.slice(0, colonIdx).trim().toLowerCase();
    const val = part.slice(colonIdx + 1).trim();
    if (!ALLOWED_STYLE_PROPS.has(prop) || !val || UNSAFE_CSS_VALUE.test(val)) continue;
    kept.push(`${prop}: ${val}`);
  }
  return kept.join('; ');
};

type DomAttrLike = { name: string; value: string };
type DomNodeLike = {
  nodeType: number;
  parentNode: DomNodeLike | null;
  firstChild: DomNodeLike | null;
  childNodes: ArrayLike<DomNodeLike>;
  insertBefore: (node: DomNodeLike, ref: DomNodeLike | null) => DomNodeLike;
  remove: () => void;
};
type DomElementLike = DomNodeLike & {
  tagName: string;
  attributes: ArrayLike<DomAttrLike>;
  getAttribute: (name: string) => string | null;
  setAttribute: (name: string, value: string) => void;
  removeAttribute: (name: string) => void;
};
type DomDocLike = {
  body: DomElementLike & { innerHTML: string };
};
type DomParserCtor = new () => { parseFromString: (html: string, mime: string) => DomDocLike };

const sanitizeElementTree = (root: DomElementLike, doc: DomDocLike): void => {
  const children = Array.from(root.childNodes);
  for (const node of children) {
    if (node.nodeType !== 1) continue; // giữ text node
    const el = node as DomElementLike;
    const tag = el.tagName.toLowerCase();

    if (STRIP_WITH_CONTENT_TAGS.has(tag)) {
      el.remove();
      continue;
    }

    // Đệ quy xử lý con trước khi unwrap/giữ lại
    sanitizeElementTree(el, doc);

    if (!ALLOWED_TAGS.has(tag)) {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        el.remove();
      }
      continue;
    }

    // Lọc attributes theo allowlist
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const val = attr.value;

      if (name.startsWith('on')) {
        el.removeAttribute(attr.name);
        continue;
      }

      if (name === 'class') {
        if (!SAFE_CLASS.test(val.trim())) el.removeAttribute(attr.name);
        continue;
      }

      if (name === 'style') {
        const clean = filterStyle(val);
        if (clean) el.setAttribute('style', clean);
        else el.removeAttribute('style');
        continue;
      }

      if (tag === 'a' && name === 'href') {
        if (!SAFE_LINK_HREF.test(val.trim())) el.removeAttribute('href');
        continue;
      }

      if (tag === 'img' && (name === 'src' || name === 'alt' || name === 'title' || name === 'data-img-name')) {
        if (name === 'src' && !SAFE_IMG_SRC.test(val.trim())) el.removeAttribute('src');
        continue;
      }

      el.removeAttribute(attr.name);
    }

    if (tag === 'a') {
      const href = el.getAttribute('href') || '';
      if (/^https?:\/\//i.test(href)) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
    }
  }
};

const fallbackRegexSanitize = (html: string): string =>
  html
    .replace(/<(script|style|iframe|object|embed|form|svg|math)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '$1=$2#$2');

/** Làm sạch HTML theo allowlist an toàn, giữ định dạng font/cỡ/màu/căn lề kiểu WordPress. */
export const sanitizeRichHtml = (html: string): string => {
  if (!html) return '';
  const Parser = (globalThis as { DOMParser?: DomParserCtor }).DOMParser;
  if (!Parser) return fallbackRegexSanitize(html);
  const doc = new Parser().parseFromString(html, 'text/html');
  sanitizeElementTree(doc.body, doc);
  return doc.body.innerHTML;
};

/** Chuyển HTML hoặc Markdown thành văn bản thuần (tính phút đọc, tạo đoạn trích, chia sẻ Facebook). */
export const stripHtmlToText = (content: string): string => {
  if (!content) return '';
  if (isHtmlContent(content)) {
    return content
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(p|div|h[1-6]|li|blockquote|figure)>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return content
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const escapeHtmlText = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const inlineMarkdownToHtml = (text: string): string => {
  let out = escapeHtmlText(text);
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => {
    const safeSrc = SAFE_IMG_SRC.test(src.trim()) ? src.trim() : '';
    return safeSrc ? `<img src="${escapeHtmlText(safeSrc)}" alt="${alt}" />` : '';
  });
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => {
    const safeHref = SAFE_LINK_HREF.test(href.trim()) ? href.trim() : '#';
    return `<a href="${escapeHtmlText(safeHref)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return out;
};

/** Chuyển Markdown cũ sang HTML cơ bản để mở chỉnh sửa mượt mà trong Rich Text Editor. */
export const markdownToBasicHtml = (md: string): string => {
  if (!md) return '';
  if (isHtmlContent(md)) return sanitizeRichHtml(md);

  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      html.push('<hr />');
      i += 1;
      continue;
    }
    const heading = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (heading) {
      const level = Math.min(4, Math.max(2, heading[1].length + 1));
      html.push(`<h${level}>${inlineMarkdownToHtml(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }
    const imgOnly = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(trimmed);
    if (imgOnly) {
      const alt = escapeHtmlText(imgOnly[1]);
      const src = escapeHtmlText(imgOnly[2].trim());
      html.push(
        `<figure class="rte-figure align-center"><img src="${src}" alt="${alt}" />${
          alt ? `<figcaption>${alt}</figcaption>` : ''
        }</figure>`,
      );
      i += 1;
      continue;
    }
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      html.push(`<blockquote><p>${inlineMarkdownToHtml(quoteLines.join(' '))}</p></blockquote>`);
      continue;
    }
    if (/^[-*+]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        items.push(`<li>${inlineMarkdownToHtml(lines[i].trim().replace(/^[-*+]\s+/, ''))}</li>`);
        i += 1;
      }
      html.push(`<ul>${items.join('')}</ul>`);
      continue;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(`<li>${inlineMarkdownToHtml(lines[i].trim().replace(/^\d+\.\s+/, ''))}</li>`);
        i += 1;
      }
      html.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,4}\s+|>\s?|[-*+]\s+|\d+\.\s+|-{3,}$|\*{3,}$|!\[)/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i += 1;
    }
    html.push(`<p>${inlineMarkdownToHtml(paraLines.join('<br />'))}</p>`);
  }

  return html.join('\n');
};
