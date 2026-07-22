// Parser Markdown gọn cho bài viết tin tức — đủ dùng cho nội dung soạn tay:
// heading (#..###), đoạn văn, **đậm**, *nghiêng*, `code`, [link](url), ![ảnh](file),
// danh sách -/*/1., trích dẫn >, kẻ ngang ---, khối code ```.
// Trả về mảng token thuần (không HTML) để component Markdown.jsx render bằng React
// element — nhờ đó không cần dangerouslySetInnerHTML, không lo XSS.

/** Tách toàn bộ văn bản Markdown thành mảng block token. */
export function parseMarkdown(text) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (!line.trim()) {
      index += 1
      continue
    }

    if (line.trim().startsWith('```')) {
      const code = []
      index += 1
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        code.push(lines[index])
        index += 1
      }
      index += 1 // bỏ dòng ``` đóng
      blocks.push({ type: 'code', text: code.join('\n') })
      continue
    }

    const heading = line.match(/^(#{1,3})\s+(.*)/)
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, spans: parseInline(heading[2]) })
      index += 1
      continue
    }

    if (/^(-{3,}|\*{3,})\s*$/.test(line.trim())) {
      blocks.push({ type: 'hr' })
      index += 1
      continue
    }

    if (line.trim().startsWith('>')) {
      const quote = []
      while (index < lines.length && lines[index].trim().startsWith('>')) {
        quote.push(lines[index].trim().replace(/^>\s?/, ''))
        index += 1
      }
      blocks.push({ type: 'quote', spans: parseInline(quote.join(' ')) })
      continue
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items = []
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
        items.push(parseInline(lines[index].replace(/^\s*[-*+]\s+/, '')))
        index += 1
      }
      blocks.push({ type: 'list', ordered: false, items })
      continue
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = []
      while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index])) {
        items.push(parseInline(lines[index].replace(/^\s*\d+[.)]\s+/, '')))
        index += 1
      }
      blocks.push({ type: 'list', ordered: true, items })
      continue
    }

    // Dòng chỉ có 1 ảnh → block ảnh riêng (hiển thị to, kèm chú thích).
    // Tên file trong (...) cho phép chứa dấu cách — VD ![Ảnh](Nhà sinh viên nữ.jpg).
    const soloImage = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (soloImage) {
      blocks.push({ type: 'image', alt: soloImage[1], src: soloImage[2].trim() })
      index += 1
      continue
    }

    // Đoạn văn: gom các dòng liền nhau tới khi gặp dòng trống/block khác.
    const paragraph = []
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,3}\s|>|```|\s*[-*+]\s+|\s*\d+[.)]\s+)/.test(lines[index]) &&
      !/^(-{3,}|\*{3,})\s*$/.test(lines[index].trim())
    ) {
      paragraph.push(lines[index].trim())
      index += 1
    }
    blocks.push({ type: 'paragraph', spans: parseInline(paragraph.join(' ')) })
  }

  return blocks
}

/** Tách 1 dòng văn bản thành mảng span: text / bold / italic / code / link / image. */
export function parseInline(text) {
  const spans = []
  let rest = String(text || '')

  const pattern =
    /(!\[[^\]]*\]\([^)]+\))|(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)/

  while (rest) {
    const match = rest.match(pattern)
    if (!match) {
      spans.push({ type: 'text', text: rest })
      break
    }
    if (match.index > 0) {
      spans.push({ type: 'text', text: rest.slice(0, match.index) })
    }
    const token = match[0]
    if (token.startsWith('![')) {
      const image = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
      spans.push({ type: 'image', alt: image[1], src: image[2].trim() })
    } else if (token.startsWith('[')) {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      spans.push({ type: 'link', text: link[1], href: link[2].trim() })
    } else if (token.startsWith('**')) {
      spans.push({ type: 'bold', text: token.slice(2, -2) })
    } else if (token.startsWith('*')) {
      spans.push({ type: 'italic', text: token.slice(1, -1) })
    } else {
      spans.push({ type: 'code', text: token.slice(1, -1) })
    }
    rest = rest.slice(match.index + token.length)
  }

  return spans
}
