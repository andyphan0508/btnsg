import { useState } from 'react';
import { NOTE_CATEGORY_LABELS, type NoteCategory } from '@btnsg/shared';
import { uploadAudio } from '../../../lib/images';
import { isSupabaseConfigured } from '../../../lib/supabase';

const YOUTUBE = /(?:youtube\.com\/(?:watch\?v=|live\/|shorts\/)|youtu\.be\/)([\w-]{11})/;

type NoteMetaFormProps = {
  title: string;
  category: NoteCategory;
  date: string;
  speaker: string;
  scripture: string;
  tagsText: string;
  published: boolean;
  audioUrl: string;
  onAudioUrlChange: (value: string) => void;
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
  audioUrl,
  onAudioUrlChange,
  onTitleChange,
  onCategoryChange,
  onDateChange,
  onSpeakerChange,
  onScriptureChange,
  onTagsTextChange,
  onPublishedChange,
}: NoteMetaFormProps) => {
  const [uploadState, setUploadState] = useState<string | null>(null);

  const pickAudio = async (file: File | undefined) => {
    if (!file) return;
    setUploadState(`Đang tải lên ${(file.size / 1024 / 1024).toFixed(1)}MB…`);
    try {
      onAudioUrlChange(await uploadAudio(file));
      setUploadState(`Đã tải lên (${(file.size / 1024 / 1024).toFixed(1)}MB) — nhớ bấm Lưu.`);
    } catch (error) {
      setUploadState(error instanceof Error ? error.message : String(error));
    }
  };

  const isUploading = uploadState?.startsWith('Đang') ?? false;

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
          <div className="field span-2">
            <label className="field-label">Audio bài giảng</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                value={audioUrl}
                placeholder="Dán link YouTube / link MP3, hoặc tải file lên"
                onChange={(e) => onAudioUrlChange(e.target.value)}
              />
              {isSupabaseConfigured && (
                <label className="btn btn-outline" style={{ flex: 'none', cursor: isUploading ? 'wait' : 'pointer' }}>
                  {isUploading ? 'Đang tải…' : 'Tải audio'}
                  <input
                    type="file"
                    accept=".mp3,.m4a,.ogg,.opus,audio/mpeg,audio/mp4"
                    hidden
                    disabled={isUploading}
                    onChange={(e) => {
                      pickAudio(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
              {audioUrl && (
                <button type="button" className="btn btn-outline" style={{ flex: 'none' }} onClick={() => onAudioUrlChange('')}>
                  Bỏ audio
                </button>
              )}
            </div>
            {uploadState && <span className="cell-muted">{uploadState}</span>}
            {audioUrl && !YOUTUBE.test(audioUrl) && /^https:\/\//.test(audioUrl) && (
              <audio controls preload="none" src={audioUrl} style={{ width: '100%', marginTop: 8 }} />
            )}
            {audioUrl && YOUTUBE.test(audioUrl) && <span className="cell-muted">Link YouTube — web sẽ nhúng trình phát.</span>}
            <span className="cell-muted" style={{ fontSize: '0.8rem' }}>
              Link YouTube không tốn dung lượng. Tải file: tối đa 50MB — nên xuất MP3 mono ~48kbps (40 phút ≈ 14MB).
            </span>
          </div>
        )}
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
