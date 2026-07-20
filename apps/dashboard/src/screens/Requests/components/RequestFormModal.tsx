import { useEffect, useState } from 'react';
import type { RequestItem, RequestStatus } from '@btnsg/shared';
import { REQUEST_STATUS_LABELS } from '@btnsg/shared';
import Modal from '../../../ui/Modal';

export type RequestFormValues = {
  title: string;
  content: string;
  requesterName: string;
  status: RequestStatus;
  response: string;
};

const EMPTY_FORM: RequestFormValues = {
  title: '',
  content: '',
  requesterName: '',
  status: 'open',
  response: '',
};

type RequestFormModalProps = {
  isOpen: boolean;
  editingRequest: RequestItem | null;
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSubmit: (values: RequestFormValues) => void;
};

const RequestFormModal = ({ isOpen, editingRequest, isSaving, saveError, onClose, onSubmit }: RequestFormModalProps) => {
  const [formValues, setFormValues] = useState<RequestFormValues>(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;
    if (!editingRequest) {
      setFormValues(EMPTY_FORM);
      return;
    }
    setFormValues({
      title: editingRequest.title,
      content: editingRequest.content,
      requesterName: editingRequest.requesterName,
      status: editingRequest.status,
      response: editingRequest.response ?? '',
    });
  }, [isOpen, editingRequest]);

  const setField = <K extends keyof RequestFormValues>(field: K, value: RequestFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      title={editingRequest ? 'Cập nhật request' : 'Ghi nhận request mới'}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
          <button type="button" className="btn btn-primary" disabled={isSaving} onClick={() => onSubmit(formValues)}>
            {isSaving ? 'Đang lưu…' : 'Lưu request'}
          </button>
        </>
      }
    >
      {saveError && <div className="form-error">{saveError}</div>}
      <div className="field">
        <label className="field-label">Tiêu đề *</label>
        <input
          className="input"
          placeholder="VD: Xin hỗ trợ âm thanh cho buổi truyền giảng"
          value={formValues.title}
          onChange={(e) => setField('title', e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label">Nội dung chi tiết *</label>
        <textarea className="textarea" value={formValues.content} onChange={(e) => setField('content', e.target.value)} />
      </div>
      <div className="form-grid">
        <div className="field">
          <label className="field-label">Người gửi *</label>
          <input className="input" value={formValues.requesterName} onChange={(e) => setField('requesterName', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Trạng thái</label>
          <select className="select" value={formValues.status} onChange={(e) => setField('status', e.target.value as RequestStatus)}>
            {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label className="field-label">Phản hồi của Ban Điều Hành</label>
        <textarea className="textarea" value={formValues.response} onChange={(e) => setField('response', e.target.value)} />
      </div>
    </Modal>
  );
};

export default RequestFormModal;
