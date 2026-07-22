import { parseMarkdown } from '../lib/markdown.js'
import { driveImage } from '../lib/gallery.js'

/**
 * Render Markdown của bài viết tin tức thành React element.
 * imageMap: { tênFileẢnh (thường) → Drive file ID } — cho phép trong bài viết
 * chỉ cần viết ![Chú thích](ten-anh.jpg) với tên file ảnh nằm cùng folder Drive.
 * coverId: ảnh bìa đã hiện trên đầu bài — gặp lại trong nội dung thì bỏ qua, tránh trùng.
 */
export default function Markdown({ content, imageMap = {}, coverId = '' }) {
  const blocks = parseMarkdown(content)

  const resolveImageId = (src) => {
    // normalize('NFC'): tiếng Việt có 2 dạng mã hoá (dựng sẵn/tổ hợp) — quy về một dạng
    // để tên file gõ trong bài .md luôn khớp tên file thật trên Drive.
    const key = src.normalize('NFC').toLowerCase()
    return imageMap[key] || imageMap[key.replace(/\.[a-z0-9]+$/i, '')] || ''
  }

  const resolveImageSrc = (src) => {
    if (/^https?:\/\//.test(src)) return src
    const id = resolveImageId(src)
    return id ? driveImage(id, 1200) : ''
  }

  const renderSpan = (span, key) => {
    if (span.type === 'bold') return <strong key={key}>{span.text}</strong>
    if (span.type === 'italic') return <em key={key}>{span.text}</em>
    if (span.type === 'code') return <code key={key}>{span.text}</code>
    if (span.type === 'link') {
      return (
        <a key={key} href={span.href} target="_blank" rel="noopener noreferrer">
          {span.text}
        </a>
      )
    }
    if (span.type === 'image') {
      const src = resolveImageSrc(span.src)
      if (!src) return null
      return <img key={key} className="news-inline-img" src={src} alt={span.alt} loading="lazy" />
    }
    return span.text
  }

  const renderSpans = (spans) => spans.map(renderSpan)

  const renderBlock = (block, key) => {
    if (block.type === 'heading') {
      const Tag = `h${block.level + 1}` // # trong bài → h2 (h1 dành cho tiêu đề bài viết)
      return <Tag key={key}>{renderSpans(block.spans)}</Tag>
    }
    if (block.type === 'quote') return <blockquote key={key}>{renderSpans(block.spans)}</blockquote>
    if (block.type === 'hr') return <hr key={key} />
    if (block.type === 'code') {
      return (
        <pre key={key}>
          <code>{block.text}</code>
        </pre>
      )
    }
    if (block.type === 'list') {
      const Tag = block.ordered ? 'ol' : 'ul'
      return (
        <Tag key={key}>
          {block.items.map((item, i) => (
            <li key={i}>{renderSpans(item)}</li>
          ))}
        </Tag>
      )
    }
    if (block.type === 'image') {
      if (coverId && resolveImageId(block.src) === coverId) return null
      const src = resolveImageSrc(block.src)
      if (!src) return null
      return (
        <figure key={key} className="news-figure">
          <img src={src} alt={block.alt} loading="lazy" decoding="async" />
          {block.alt && <figcaption>{block.alt}</figcaption>}
        </figure>
      )
    }
    return <p key={key}>{renderSpans(block.spans)}</p>
  }

  return <div className="news-content">{blocks.map(renderBlock)}</div>
}
