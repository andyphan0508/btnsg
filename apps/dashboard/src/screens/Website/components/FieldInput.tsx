import { useState } from 'react';
import { toSiteImageUrl, type SiteField } from '@btnsg/shared';
import { uploadSiteImage } from '../../../lib/images';
import { isSupabaseConfigured } from '../../../lib/supabase';

/** <datalist> gợi ý tag (tag ảnh Khoảnh khắc) — màn hình Website render một lần. */
export const TAG_DATALIST_ID = 'website-moment-tags';

type FieldInputProps = {
  field: SiteField;
  value: unknown;
  onChange: (value: unknown) => void;
};

/** Ô nhập cho một trường nội dung landing — kiểu ô theo `field.type` trong @btnsg/shared. */
const FieldInput = ({ field, value, onChange }: FieldInputProps) => {
  const text = typeof value === 'string' ? value : '';
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      onChange(await uploadSiteImage(file));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : String(error));
    } finally {
      setUploading(false);
    }
  };

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
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                value={text}
                placeholder="Tải ảnh lên, hoặc dán link https://…"
                onChange={(e) => onChange(e.target.value)}
              />
              {isSupabaseConfigured && (
                <label className="btn btn-outline" style={{ flex: 'none', cursor: uploading ? 'wait' : 'pointer' }}>
                  {uploading ? 'Đang tải…' : 'Tải ảnh'}
                  <input
                    type="file"
                    accept="image/*,.heic,.heif"
                    hidden
                    disabled={uploading}
                    onChange={(e) => {
                      pickImage(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
              {text && (
                <button type="button" className="btn btn-outline" style={{ flex: 'none' }} onClick={() => onChange('')}>
                  Bỏ ảnh
                </button>
              )}
            </div>
            {uploadError && <span className="website-warn">{uploadError}</span>}
            {text && (imageUrl ? <img src={imageUrl} alt="" /> : <span className="website-warn">Link ảnh không hợp lệ</span>)}
          </div>
        );
      }
      case 'tag':
        return (
          <input
            className="input"
            list={TAG_DATALIST_ID}
            value={text}
            placeholder="VD: Trại hè"
            onChange={(e) => onChange(e.target.value)}
          />
        );
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
    <label className={`field${['text', 'url', 'select', 'tag'].includes(field.type) ? '' : ' span-2'}`}>
      <span className="field-label">{field.label}</span>
      {renderControl()}
      {field.hint && <small className="website-hint">{field.hint}</small>}
    </label>
  );
};

export default FieldInput;
