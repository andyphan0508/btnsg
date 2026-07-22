import { parseMarkdown, type InlineSpan, type MarkdownBlock } from '../../../lib/markdown';

type NewsMarkdownPreviewProps = {
  title: string;
  date: string;
  description: string;
  markdown: string;
  /** name (đã thường hoá NFC, có/không đuôi file) → URL preview. */
  resolveImageUrl: (src: string) => string;
  coverUrl: string;
};

const formatDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  return `${day} tháng ${month}, ${year}`;
};

/** Preview bài viết đúng thứ tự hiển thị trên landing: ngày → tiêu đề → mô tả → ảnh bìa → nội dung. */
const NewsMarkdownPreview = ({
  title,
  date,
  description,
  markdown,
  resolveImageUrl,
  coverUrl,
}: NewsMarkdownPreviewProps) => {
  const styles = createStyles();
  const blocks = parseMarkdown(markdown);

  const renderSpan = (span: InlineSpan, key: number) => {
    if (span.type === 'bold') return <strong key={key}>{span.text}</strong>;
    if (span.type === 'italic') return <em key={key}>{span.text}</em>;
    if (span.type === 'code') return <code key={key} style={styles.inlineCode}>{span.text}</code>;
    if (span.type === 'link') {
      return (
        <a key={key} href={span.href} target="_blank" rel="noopener noreferrer" style={styles.link}>
          {span.text}
        </a>
      );
    }
    if (span.type === 'image') {
      const src = resolveImageUrl(span.src);
      if (!src) return <em key={key} style={styles.missingImage}>[không tìm thấy ảnh: {span.src}]</em>;
      return <img key={key} src={src} alt={span.alt} style={styles.inlineImage} />;
    }
    return span.text;
  };

  const renderSpans = (spans: InlineSpan[]) => spans.map(renderSpan);

  const renderBlock = (block: MarkdownBlock, key: number) => {
    if (block.type === 'heading') {
      const Tag = `h${block.level + 1}` as 'h2' | 'h3' | 'h4';
      return <Tag key={key} style={styles.heading}>{renderSpans(block.spans)}</Tag>;
    }
    if (block.type === 'quote') {
      return <blockquote key={key} style={styles.quote}>{renderSpans(block.spans)}</blockquote>;
    }
    if (block.type === 'hr') return <hr key={key} style={styles.hr} />;
    if (block.type === 'code') {
      return (
        <pre key={key} style={styles.codeBlock}>
          <code>{block.text}</code>
        </pre>
      );
    }
    if (block.type === 'list') {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag key={key} style={styles.listBlock}>
          {block.items.map((item, i) => (
            <li key={i}>{renderSpans(item)}</li>
          ))}
        </Tag>
      );
    }
    if (block.type === 'image') {
      const src = resolveImageUrl(block.src);
      if (!src) {
        return (
          <div key={key} style={styles.missingImageBlock}>
            Không tìm thấy ảnh “{block.src}” — kiểm tra tên file trong danh sách ảnh.
          </div>
        );
      }
      return (
        <figure key={key} style={styles.figure}>
          <img src={src} alt={block.alt} style={styles.figureImage} />
          {block.alt && <figcaption style={styles.figcaption}>{block.alt}</figcaption>}
        </figure>
      );
    }
    return <p key={key} style={styles.paragraph}>{renderSpans(block.spans)}</p>;
  };

  return (
    <div style={styles.wrap}>
      {date && <div style={styles.date}>{formatDate(date)}</div>}
      <h3 style={styles.title}>{title || '(Chưa có tiêu đề)'}</h3>
      {description && <p style={styles.lead}>{description}</p>}
      {coverUrl && <img src={coverUrl} alt="Ảnh bìa" style={styles.cover} />}
      {markdown.trim() ? (
        blocks.map(renderBlock)
      ) : (
        <p className="cell-muted">Nội dung Markdown sẽ hiển thị ở đây khi bạn soạn.</p>
      )}
    </div>
  );
};

export default NewsMarkdownPreview;

const createStyles = () => {
  return {
    wrap: { fontSize: '0.92rem', lineHeight: 1.7 },
    date: {
      color: 'var(--brand)',
      fontSize: '0.74rem',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
      marginBottom: 4,
    },
    title: { fontSize: '1.25rem', lineHeight: 1.3, margin: '0 0 6px' },
    lead: { color: 'var(--ink-2)', margin: '0 0 10px' },
    cover: {
      width: '100%',
      borderRadius: 10,
      marginBottom: 12,
      display: 'block',
    },
    paragraph: { margin: '0 0 0.9em' },
    heading: { margin: '1.2em 0 0.4em', lineHeight: 1.3 },
    quote: {
      margin: '1em 0',
      padding: '8px 14px',
      borderLeft: '3px solid var(--brand)',
      background: 'var(--brand-soft)',
      borderRadius: '0 8px 8px 0',
      fontStyle: 'italic' as const,
    },
    listBlock: { margin: '0 0 0.9em', paddingLeft: '1.4em' },
    inlineCode: {
      background: 'var(--surface-2)',
      borderRadius: 6,
      padding: '0.1em 0.35em',
      fontSize: '0.9em',
    },
    codeBlock: {
      background: 'var(--surface-2)',
      borderRadius: 8,
      padding: '10px 12px',
      overflowX: 'auto' as const,
      margin: '0 0 0.9em',
    },
    hr: { border: 'none', borderTop: '1px solid var(--line, #e5decf)', margin: '1.4em 0' },
    link: { color: 'var(--brand)' },
    figure: { margin: '1.2em 0' },
    figureImage: { maxWidth: '100%', borderRadius: 10, display: 'block', margin: '0 auto' },
    figcaption: {
      color: 'var(--ink-3, #98897b)',
      fontSize: '0.8rem',
      fontStyle: 'italic' as const,
      textAlign: 'center' as const,
      marginTop: 6,
    },
    inlineImage: { maxWidth: '100%', borderRadius: 8, display: 'block' },
    missingImage: { color: '#b3261e' },
    missingImageBlock: {
      color: '#b3261e',
      background: 'rgba(179, 38, 30, 0.08)',
      borderRadius: 8,
      padding: '8px 12px',
      margin: '0 0 0.9em',
      fontSize: '0.84rem',
    },
  };
};
