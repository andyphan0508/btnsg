import { useEffect, useState } from 'react';
import { extractTemplateFields, type EmailTemplate } from '@btnsg/shared';
import Modal from '../../../ui/Modal';

export type TemplateFormValues = {
  name: string;
  subject: string;
  body: string;
  description: string;
};

const EMPTY_FORM: TemplateFormValues = { name: '', subject: '', body: '', description: '' };

type TemplateFormModalProps = {
  isOpen: boolean;
  editingTemplate: EmailTemplate | null;
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSubmit: (values: TemplateFormValues) => void;
};

const TemplateFormModal = ({
  isOpen,
  editingTemplate,
  isSaving,
  saveError,
  onClose,
  onSubmit,
}: TemplateFormModalProps) => {
  const [formValues, setFormValues] = useState<TemplateFormValues>(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;
    if (!editingTemplate) {
      setFormValues(EMPTY_FORM);
      return;
    }
    setFormValues({
      name: editingTemplate.name,
      subject: editingTemplate.subject,
      body: editingTemplate.body,
      description: editingTemplate.description ?? '',
    });
  }, [isOpen, editingTemplate]);

  const setField = <K extends keyof TemplateFormValues>(field: K, value: TemplateFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const detectedFields = extractTemplateFields({ subject: formValues.subject, body: formValues.body });

  return (
    <Modal
      title={editingTemplate ? 'Sửa template email' : 'Tạo template email mới'}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
          <button type="button" className="btn btn-primary" disabled={isSaving} onClick={() => onSubmit(formValues)}>
            {isSaving ? 'Đang lưu…' : 'Lưu template'}
          </button>
        </>
      }
    >
      {saveError && <div className="form-error">{saveError}</div>}
      <div className="form-grid">
        <div className="field">
          <label className="field-label">Tên template *</label>
          <input className="input" value={formValues.name} onChange={(e) => setField('name', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Mô tả ngắn</label>
          <input className="input" value={formValues.description} onChange={(e) => setField('description', e.target.value)} />
        </div>
        <div className="field span-2">
          <label className="field-label">Tiêu đề email * (dùng {'{{ten_truong}}'} để tạo trường điền)</label>
          <input className="input" value={formValues.subject} onChange={(e) => setField('subject', e.target.value)} />
        </div>
        <div className="field span-2">
          <label className="field-label">Nội dung *</label>
          <textarea
            className="textarea"
            style={{ minHeight: 220 }}
            value={formValues.body}
            onChange={(e) => setField('body', e.target.value)}
          />
        </div>
      </div>
      {detectedFields.length > 0 && (
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <span className="cell-muted">Các trường sẽ cần điền:</span>
          {detectedFields.map((field) => (
            <span className="badge badge-blue" key={field}>{field}</span>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default TemplateFormModal;
