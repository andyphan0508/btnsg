import { toSiteImageUrl, type SiteField } from '@btnsg/shared';

type FieldInputProps = {
  field: SiteField;
  value: unknown;
  onChange: (value: unknown) => void;
};

/** Ô nhập cho một trường nội dung landing — kiểu ô theo `field.type` trong @btnsg/shared. */
const FieldInput = ({ field, value, onChange }: FieldInputProps) => {
  const text = typeof value === 'string' ? value : '';

  if (field.type === 'checkbox') {
    return (
      <label className="check-item" style={{ padding: 0 }}>
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        {field.label}
      </label>
    );
  }

  const renderControl = () => {
    switch (field.type) {
      case 'textarea':
      case 'rich':
        return <textarea className="textarea" rows={3} value={text} onChange={(e) => onChange(e.target.value)} />;
      case 'lines':
        return (
          <textarea
            className="textarea"
            rows={4}
            value={Array.isArray(value) ? value.join('\n') : text}
            // Giữ cả dòng trống khi đang gõ; dòng trống bị bỏ khi xem trước / lưu.
            onChange={(e) => onChange(e.target.value.split('\n'))}
          />
        );
      case 'select':
        return (
          <select className="select" value={text} onChange={(e) => onChange(e.target.value)}>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'image': {
        const imageUrl = toSiteImageUrl(text, 400);
        return (
          <div className="website-image">
            <input className="input" value={text} placeholder="https://drive.google.com/file/d/…" onChange={(e) => onChange(e.target.value)} />
            {text && (imageUrl ? <img src={imageUrl} alt="" /> : <span className="website-warn">Link ảnh không hợp lệ</span>)}
          </div>
        );
      }
      default:
        return (
          <input
            className="input"
            type={field.type === 'url' ? 'url' : 'text'}
            value={text}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <label className={`field${['text', 'url', 'select'].includes(field.type) ? '' : ' span-2'}`}>
      <span className="field-label">{field.label}</span>
      {renderControl()}
      {field.hint && <small className="website-hint">{field.hint}</small>}
    </label>
  );
};

export default FieldInput;
