import { useEffect, useState } from 'react';
import type { Announcement } from '@btnsg/shared';
import Modal from '../../../ui/Modal';

export type AnnouncementFormValues = {
  title: string;
  content: string;
  author: string;
  pinned: boolean;
};

const EMPTY_FORM: AnnouncementFormValues = {
  title: '',
  content: '',
  author: '',
  pinned: false,
};

type AnnouncementFormModalProps = {
  isOpen: boolean;
  editingAnnouncement: Announcement | null;
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSubmit: (values: AnnouncementFormValues) => void;
};

const AnnouncementFormModal = ({
  isOpen,
  editingAnnouncement,
  isSaving,
  saveError,
  onClose,
  onSubmit,
}: AnnouncementFormModalProps) => {
  const [formValues, setFormValues] = useState<AnnouncementFormValues>(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;
    if (!editingAnnouncement) {
      setFormValues(EMPTY_FORM);
      return;
    }
    setFormValues({
      title: editingAnnouncement.title,
      content: editingAnnouncement.content,
      author: editingAnnouncement.author ?? '',
      pinned: editingAnnouncement.pinned,
    });
  }, [isOpen, editingAnnouncement]);

  const setField = <K extends keyof AnnouncementFormValues>(field: K, value: AnnouncementFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      title={editingAnnouncement ? 'Cập nhật thông báo' : 'Tạo thông báo'}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
          <button type="button" className="btn btn-primary" disabled={isSaving} onClick={() => onSubmit(formValues)}>
            {isSaving ? 'Đang lưu…' : 'Đăng thông báo'}
          </button>
        </>
      }
    >
      {saveError && <div className="form-error">{saveError}</div>}
      <div className="field">
        <label className="field-label">Tiêu đề *</label>
        <input className="input" value={formValues.title} onChange={(e) => setField('title', e.target.value)} />
      </div>
      <div className="field">
        <label className="field-label">Nội dung *</label>
        <textarea
          className="textarea"
          rows={5}
          placeholder="VD: Chúa Nhật tuần này nhóm lúc 14:30 tại Lầu 2…"
          value={formValues.content}
          onChange={(e) => setField('content', e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label">Người đăng</label>
        <input className="input" value={formValues.author} onChange={(e) => setField('author', e.target.value)} />
      </div>
      <label className="check-item" style={{ padding: 0 }}>
        <input type="checkbox" checked={formValues.pinned} onChange={(e) => setField('pinned', e.target.checked)} />
        Ghim thông báo này lên đầu
      </label>
    </Modal>
  );
};

export default AnnouncementFormModal;
