import { useRef } from 'react';
import { FiBold, FiCode, FiHash, FiItalic, FiLink, FiList, FiMinus } from 'react-icons/fi';

type NoteMarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type EditResult = { next: string; selectionStart: number; selectionEnd: number };

/** Bọc đoạn text đang chọn bằng cặp ký hiệu (bold/italic/code/link…); chèn placeholder nếu chưa chọn gì. */
const wrapSelection = (
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholder: string,
): EditResult => {
  const selected = value.slice(start, end) || placeholder;
  const next = value.slice(0, start) + before + selected + after + value.slice(end);
  return { next, selectionStart: start + before.length, selectionEnd: start + before.length + selected.length };
};

/** Thêm tiền tố vào đầu mỗi dòng trong vùng chọn (heading/quote/list). */
const prefixLines = (
  value: string,
  start: number,
  end: number,
  makePrefix: (lineIndex: number) => string,
): EditResult => {
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const nextBreak = value.indexOf('\n', Math.max(end - 1, lineStart));
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;
  const block = value.slice(lineStart, lineEnd) || ' ';
  const nextBlock = block
    .split('\n')
    .map((line, i) => `${makePrefix(i)}${line}`)
    .join('\n');
  const next = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
  return { next, selectionStart: lineStart, selectionEnd: lineStart + nextBlock.length };
};

/** Thanh soạn thảo Markdown kiểu "rich text nhẹ": chọn text rồi bấm nút để định dạng. */
const NoteMarkdownEditor = ({ value, onChange, placeholder }: NoteMarkdownEditorProps) => {
  const styles = createStyles();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyEdit = (make: (start: number, end: number) => EditResult): void => {
    const el = textareaRef.current;
    if (!el) return;
    const { next, selectionStart, selectionEnd } = make(el.selectionStart, el.selectionEnd);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const actions: { label: string; icon: JSX.Element; run: () => void }[] = [
    {
      label: 'Đậm',
      icon: <FiBold />,
      run: () => applyEdit((s, e) => wrapSelection(value, s, e, '**', '**', 'chữ đậm')),
    },
    {
      label: 'Nghiêng',
      icon: <FiItalic />,
      run: () => applyEdit((s, e) => wrapSelection(value, s, e, '*', '*', 'chữ nghiêng')),
    },
    {
      label: 'Tiêu đề phụ',
      icon: <FiHash />,
      run: () => applyEdit((s, e) => prefixLines(value, s, e, () => '## ')),
    },
    {
      label: 'Trích dẫn',
      icon: <span style={styles.quoteGlyph}>&ldquo;</span>,
      run: () => applyEdit((s, e) => prefixLines(value, s, e, () => '> ')),
    },
    {
      label: 'Danh sách',
      icon: <FiList />,
      run: () => applyEdit((s, e) => prefixLines(value, s, e, () => '- ')),
    },
    {
      label: 'Danh sách số',
      icon: <span style={styles.olGlyph}>1.</span>,
      run: () => applyEdit((s, e) => prefixLines(value, s, e, (i) => `${i + 1}. `)),
    },
    {
      label: 'Mã code',
      icon: <FiCode />,
      run: () => applyEdit((s, e) => wrapSelection(value, s, e, '`', '`', 'code')),
    },
    {
      label: 'Liên kết',
      icon: <FiLink />,
      run: () => applyEdit((s, e) => wrapSelection(value, s, e, '[', '](https://)', 'văn bản liên kết')),
    },
    {
      label: 'Đường kẻ ngang',
      icon: <FiMinus />,
      run: () => applyEdit((s) => ({ next: `${value.slice(0, s)}\n\n---\n\n${value.slice(s)}`, selectionStart: s + 6, selectionEnd: s + 6 })),
    },
  ];

  return (
    <div style={styles.wrap}>
      <div style={styles.toolbar}>
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="btn btn-outline btn-sm"
            title={action.label}
            aria-label={action.label}
            onClick={action.run}
            style={styles.toolbarBtn}
          >
            {action.icon}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        className="input"
        style={styles.textarea}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default NoteMarkdownEditor;

const createStyles = () => {
  return {
    wrap: { display: 'flex', flexDirection: 'column' as const, gap: 8 },
    toolbar: { display: 'flex', flexWrap: 'wrap' as const, gap: 6 },
    toolbarBtn: { padding: '6px 10px' },
    quoteGlyph: { fontSize: '1.05rem', lineHeight: 1, fontWeight: 700 },
    olGlyph: { fontSize: '0.78rem', fontWeight: 700 },
    textarea: {
      minHeight: 480,
      resize: 'vertical' as const,
      fontFamily: 'ui-monospace, Consolas, monospace',
      fontSize: '0.86rem',
      lineHeight: 1.6,
    },
  };
};
