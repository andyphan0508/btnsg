import { NOTE_CATEGORY_LABELS, type NoteCategory } from '@btnsg/shared';

type NoteMetaFormProps = {
  title: string;
  category: NoteCategory;
  date: string;
  speaker: string;
  scripture: string;
  tagsText: string;
  published: boolean;
  onTitleChange: (value: string) => void;
  onCategoryChange: (value: NoteCategory) => void;
  onDateChange: (value: string) => void;
  onSpeakerChange: (value: string) => void;
  onScriptureChange: (value: string) => void;
  onTagsTextChange: (value: string) => void;
  onPublishedChange: (value: boolean) => void;
};

/** Thông tin chung của 1 mục sổ ghi chép: tiêu đề, loại, ngày, người chia sẻ, câu gốc, thẻ. */
const NoteMetaForm = ({
  title,
  category,
  date,
  speaker,
  scripture,
  tagsText,
  published,
  onTitleChange,
  onCategoryChange,
  onDateChange,
  onSpeakerChange,
  onScriptureChange,
  onTagsTextChange,
  onPublishedChange,
}: NoteMetaFormProps) => {
  return (
    <div className="card">
      <div className="card-title">Thông tin</div>
      <div className="form-grid">
        <div className="field span-2">
          <label className="field-label">Tiêu đề *</label>
          <input
            className="input"
            value={title}
            placeholder="VD: Rô-ma 12:1-2 — Dâng đời sống làm của lễ sống"
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label">Loại *</label>
          <select className="select" value={category} onChange={(e) => onCategoryChange(e.target.value as NoteCategory)}>
            {Object.entries(NOTE_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Ngày</label>
          <input className="input" type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Người chia sẻ / giảng</label>
          <input
            className="input"
            value={speaker}
            placeholder="VD: MS. Nguyễn Văn A"
            onChange={(e) => onSpeakerChange(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label">Câu gốc / đoạn Kinh Thánh</label>
          <input
            className="input"
            value={scripture}
            placeholder="VD: Rô-ma 12:1-2"
            onChange={(e) => onScriptureChange(e.target.value)}
          />
        </div>
        <div className="field span-2">
          <label className="field-label">Thẻ (tags, cách nhau bằng dấu phẩy)</label>
          <input
            className="input"
            value={tagsText}
            placeholder="VD: Dâng hiến, Môn đồ hoá, Cầu nguyện"
            onChange={(e) => onTagsTextChange(e.target.value)}
          />
        </div>
        {category === 'bai_giang' && (
          <label className="field span-2" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={published} onChange={(e) => onPublishedChange(e.target.checked)} />
            <span>Công khai trên website (trang Bài giảng) — hiện sau tối đa ~1 phút</span>
          </label>
        )}
      </div>
    </div>
  );
};

export default NoteMetaForm;
