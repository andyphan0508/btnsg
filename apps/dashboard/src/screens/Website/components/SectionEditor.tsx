import { useState } from 'react';
import { blankSiteItem, type SiteRecord, type SiteSection } from '@btnsg/shared';
import FieldInput from './FieldInput';

type SectionEditorProps = {
  section: SiteSection;
  value: SiteRecord | SiteRecord[];
  isDirty: boolean;
  onChange: (value: SiteRecord | SiteRecord[]) => void;
};

type RecordFieldsProps = {
  section: SiteSection;
  record: SiteRecord;
  onChange: (record: SiteRecord) => void;
};

const RecordFields = ({ section, record, onChange }: RecordFieldsProps) => (
  <div className="form-grid">
    {section.fields.map((field) => (
      <FieldInput
        key={field.name}
        field={field}
        value={record[field.name]}
        onChange={(fieldValue) => onChange({ ...record, [field.name]: fieldValue })}
      />
    ))}
  </div>
);

/** Một khối nội dung landing: form các ô, hoặc danh sách mục thêm / xoá / đổi thứ tự được. */
const SectionEditor = ({ section, value, isDirty, onChange }: SectionEditorProps) => {
  // Mục vừa thêm mở sẵn để gõ ngay; các mục khác gập lại cho gọn.
  const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null);
  const items = Array.isArray(value) ? value : [];

  const restoreDefaults = () => {
    if (!window.confirm(`Điền lại nội dung mặc định cho "${section.label}"? (Chỉ áp dụng khi bấm Lưu.)`)) return;
    onChange(section.defaults);
  };

  const updateItem = (index: number, item: SiteRecord) => onChange(items.map((current, i) => (i === index ? item : current)));

  const moveItem = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const removeItem = (index: number) => {
    const title = String(items[index][section.list?.titleField ?? ''] || `#${index + 1}`);
    if (!window.confirm(`Xoá "${title}"?`)) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    onChange([...items, blankSiteItem(section)]);
    setLastAddedIndex(items.length);
  };

  return (
    <section className="card website-section">
      <header className="website-section-head">
        <div>
          <h3 className="card-title" style={{ margin: 0 }}>
            {section.label} {isDirty && <span className="badge badge-amber">Chưa lưu</span>}
          </h3>
          {section.hint && <p className="website-hint">{section.hint}</p>}
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={restoreDefaults}>
          Khôi phục mặc định
        </button>
      </header>

      {!section.list ? (
        <RecordFields section={section} record={value as SiteRecord} onChange={onChange} />
      ) : (
        <div className="website-items">
          {items.map((item, index) => (
            <details className="website-item" key={index} open={index === lastAddedIndex}>
              <summary>
                <span className="website-item-title">
                  {index + 1}. {String(item[section.list!.titleField] || '(chưa đặt tên)')}
                </span>
                <span className="cell-actions" onClick={(e) => e.preventDefault()}>
                  <button type="button" className="btn btn-ghost btn-sm" disabled={index === 0} onClick={() => moveItem(index, -1)} aria-label="Lên trên">
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, 1)}
                    aria-label="Xuống dưới"
                  >
                    ↓
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(index)} aria-label="Xoá">
                    ✕
                  </button>
                </span>
              </summary>
              <RecordFields section={section} record={item} onChange={(next) => updateItem(index, next)} />
            </details>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>
            + Thêm {section.list.itemLabel}
          </button>
        </div>
      )}
    </section>
  );
};

export default SectionEditor;
