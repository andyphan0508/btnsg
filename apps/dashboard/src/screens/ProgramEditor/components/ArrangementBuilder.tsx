import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiRotateCcw, FiX } from 'react-icons/fi';

type Section = { label: string; text: string };

type ArrangementBuilderProps = {
  sections: Section[];
  /** Thứ tự in trong bài (điệp khúc sau mỗi câu) — dùng khi chưa chọn gì. */
  defaultOrder: string[];
  value: string[] | undefined;
  onChange: (arrangement: string[] | undefined) => void;
};

const shortLabel = (label: string) => label.replace(/^Điệp khúc/i, 'ĐK').replace(/^Verse/i, 'V').replace(/^Chorus/i, 'C');

/** Chọn lời hiển thị và thứ tự hát: bấm đoạn để thêm vào cuối, ←/→ đổi chỗ, × bỏ. */
const ArrangementBuilder = ({ sections, defaultOrder, value, onChange }: ArrangementBuilderProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const isCustom = !!value?.length;
  const order = isCustom ? value! : defaultOrder.length ? defaultOrder : sections.map((s) => s.label);
  const textOf = (label: string) => sections.find((s) => s.label === label)?.text ?? '';

  const set = (next: string[]) => onChange(next.length ? next : undefined);
  const move = (index: number, dir: -1 | 1) => {
    const next = [...order];
    [next[index], next[index + dir]] = [next[index + dir], next[index]];
    set(next);
  };

  if (!sections.length) return null;

  return (
    <div className="arrangement">
      <div className="arrangement-row">
        <span className="arrangement-caption">Đoạn trong bài — bấm để thêm</span>
        <div className="arrangement-chips">
          {sections.map((s) => (
            <button key={s.label} type="button" className="arr-chip arr-source" title={s.text} onClick={() => set([...order, s.label])}>
              + {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="arrangement-row">
        <span className="arrangement-caption">
          Thứ tự hát {isCustom ? '(đã chỉnh)' : '(mặc định của bài)'}
          {isCustom && (
            <button type="button" className="arr-reset" onClick={() => onChange(undefined)}>
              <FiRotateCcw /> Về mặc định
            </button>
          )}
        </span>
        <ol className="arrangement-chips arrangement-order">
          {order.map((label, index) => (
            <li key={`${label}-${index}`} className={`arr-chip ${/điệp|chorus/i.test(label) ? 'arr-chorus' : ''} ${isCustom ? '' : 'arr-muted'}`} title={textOf(label)}>
              <button type="button" aria-label="Sang trái" disabled={index === 0} onClick={() => move(index, -1)}><FiChevronLeft /></button>
              <span>{shortLabel(label)}</span>
              <button type="button" aria-label="Sang phải" disabled={index === order.length - 1} onClick={() => move(index, 1)}><FiChevronRight /></button>
              <button type="button" aria-label={`Bỏ ${label}`} onClick={() => set(order.filter((_, i) => i !== index))}><FiX /></button>
            </li>
          ))}
        </ol>
      </div>

      <button type="button" className="arr-preview-toggle" onClick={() => setShowPreview((v) => !v)}>
        {showPreview ? 'Ẩn lời' : `Xem lời theo thứ tự (${order.length} slide)`}
      </button>
      {showPreview && (
        <ol className="arr-preview">
          {order.map((label, index) => (
            <li key={`${label}-${index}`}>
              <b>{label}</b>
              <pre>{textOf(label)}</pre>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default ArrangementBuilder;
