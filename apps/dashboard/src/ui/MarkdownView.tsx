import { parseMarkdown, type InlineSpan, type MarkdownBlock } from '../lib/markdown';

type MarkdownViewProps = {
  markdown: string;
  emptyHint?: string;
};

/** Render Markdown thuần (không có phần header/ảnh bìa riêng) — dùng cho Sổ ghi chép. */
const MarkdownView = ({ markdown, emptyHint = 'Nội dung sẽ hiển thị ở đây khi bạn soạn.' }: MarkdownViewProps) => {
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
      return <img key={key} src={span.src} alt={span.alt} style={styles.inlineImage} />;
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
      return (
        <figure key={key} style={styles.figure}>
          <img src={block.src} alt={block.alt} style={styles.figureImage} />
          {block.alt && <figcaption style={styles.figcaption}>{block.alt}</figcaption>}
        </figure>
      );
    }
    return <p key={key} style={styles.paragraph}>{renderSpans(block.spans)}</p>;
  };

  if (!markdown.trim()) return <p className="cell-muted">{emptyHint}</p>;

  return <div style={styles.wrap}>{blocks.map(renderBlock)}</div>;
};

export default MarkdownView;

const createStyles = () => {
  return {
    wrap: { fontSize: '0.95rem', lineHeight: 1.75 },
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
  };
};
