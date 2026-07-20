import { useEffect, useState } from 'react';
import type { Member } from '@btnsg/shared';
import Modal from '../../../ui/Modal';

export type MemberFormValues = {
  name: string;
  role: 'member' | 'leader';
  boardRole: string;
  duties: string;
  group: string;
  phone: string;
  email: string;
  birthday: string;
  joinedAt: string;
  status: 'active' | 'inactive';
  notes: string;
};

const EMPTY_FORM: MemberFormValues = {
  name: '',
  role: 'member',
  boardRole: '',
  duties: '',
  group: '',
  phone: '',
  email: '',
  birthday: '',
  joinedAt: '',
  status: 'active',
  notes: '',
};

type MemberFormModalProps = {
  isOpen: boolean;
  editingMember: Member | null;
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSubmit: (values: MemberFormValues) => void;
};

const MemberFormModal = ({ isOpen, editingMember, isSaving, saveError, onClose, onSubmit }: MemberFormModalProps) => {
  const [formValues, setFormValues] = useState<MemberFormValues>(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;
    if (!editingMember) {
      setFormValues(EMPTY_FORM);
      return;
    }
    setFormValues({
      name: editingMember.name,
      role: editingMember.role,
      boardRole: editingMember.boardRole ?? '',
      duties: editingMember.duties.join(', '),
      group: editingMember.group ?? '',
      phone: editingMember.phone ?? '',
      email: editingMember.email ?? '',
      birthday: editingMember.birthday ?? '',
      joinedAt: editingMember.joinedAt ?? '',
      status: editingMember.status,
      notes: editingMember.notes ?? '',
    });
  }, [isOpen, editingMember]);

  const setField = <K extends keyof MemberFormValues>(field: K, value: MemberFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      title={editingMember ? 'Cập nhật thành viên' : 'Thêm thành viên mới'}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
          <button type="button" className="btn btn-primary" disabled={isSaving} onClick={() => onSubmit(formValues)}>
            {isSaving ? 'Đang lưu…' : 'Lưu thành viên'}
          </button>
        </>
      }
    >
      {saveError && <div className="form-error">{saveError}</div>}
      <div className="form-grid">
        <div className="field span-2">
          <label className="field-label">Họ và tên *</label>
          <input className="input" value={formValues.name} onChange={(e) => setField('name', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Vai trò</label>
          <select
            className="select"
            value={formValues.role}
            onChange={(e) => setField('role', e.target.value as MemberFormValues['role'])}
          >
            <option value="member">Ban viên</option>
            <option value="leader">Ban Điều Hành</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">Chức vụ (nếu là BĐH)</label>
          <input
            className="input"
            placeholder="VD: Thư ký"
            value={formValues.boardRole}
            onChange={(e) => setField('boardRole', e.target.value)}
          />
        </div>
        <div className="field span-2">
          <label className="field-label">Nhiệm vụ (phân cách bằng dấu phẩy)</label>
          <input
            className="input"
            placeholder="VD: Uỷ viên Truyền giảng, Hậu cần"
            value={formValues.duties}
            onChange={(e) => setField('duties', e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label">Nhóm nhỏ</label>
          <input className="input" value={formValues.group} onChange={(e) => setField('group', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Ngày sinh</label>
          <input type="date" className="input" value={formValues.birthday} onChange={(e) => setField('birthday', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Số điện thoại</label>
          <input className="input" value={formValues.phone} onChange={(e) => setField('phone', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Email</label>
          <input type="email" className="input" value={formValues.email} onChange={(e) => setField('email', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Ngày tham gia</label>
          <input type="date" className="input" value={formValues.joinedAt} onChange={(e) => setField('joinedAt', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Trạng thái</label>
          <select
            className="select"
            value={formValues.status}
            onChange={(e) => setField('status', e.target.value as MemberFormValues['status'])}
          >
            <option value="active">Đang sinh hoạt</option>
            <option value="inactive">Tạm vắng</option>
          </select>
        </div>
        <div className="field span-2">
          <label className="field-label">Ghi chú</label>
          <textarea className="textarea" value={formValues.notes} onChange={(e) => setField('notes', e.target.value)} />
        </div>
      </div>
    </Modal>
  );
};

export default MemberFormModal;
