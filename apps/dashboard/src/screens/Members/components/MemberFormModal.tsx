import { useEffect, useState } from 'react';
import type { Member } from '@btnsg/shared';
import Modal from '../../../ui/Modal';

export type MemberFormValues = {
  name: string;
  gender: '' | 'nam' | 'nu';
  role: 'member' | 'leader';
  boardRole: string;
  duties: string;
  group: string;
  phone: string;
  phone2: string;
  email: string;
  address: string;
  occupation: string;
  workplace: string;
  birthday: string;
  joinedAt: string;
  status: 'active' | 'inactive';
  stage: '' | 'thieu_nien' | 'thanh_nien' | 'thanh_trang';
  notes: string;
};

const EMPTY_FORM: MemberFormValues = {
  name: '',
  gender: '',
  role: 'member',
  boardRole: '',
  duties: '',
  group: '',
  phone: '',
  phone2: '',
  email: '',
  address: '',
  occupation: '',
  workplace: '',
  birthday: '',
  joinedAt: '',
  status: 'active',
  stage: '',
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
      gender: editingMember.gender ?? '',
      stage: editingMember.stage ?? '',
      role: editingMember.role,
      boardRole: editingMember.boardRole ?? '',
      duties: editingMember.duties.join(', '),
      group: editingMember.group ?? '',
      phone: editingMember.phone ?? '',
      phone2: editingMember.phone2 ?? '',
      email: editingMember.email ?? '',
      address: editingMember.address ?? '',
      occupation: editingMember.occupation ?? '',
      workplace: editingMember.workplace ?? '',
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
          <label className="field-label">Công tác đảm nhiệm (phân cách bằng dấu phẩy)</label>
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
          <label className="field-label">Giới tính</label>
          <select
            className="select"
            value={formValues.gender}
            onChange={(e) => setField('gender', e.target.value as MemberFormValues['gender'])}
          >
            <option value="">— Chưa rõ —</option>
            <option value="nam">Nam</option>
            <option value="nu">Nữ</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">Ngày sinh</label>
          <input type="date" className="input" value={formValues.birthday} onChange={(e) => setField('birthday', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Giai đoạn (tự tính nếu bỏ trống)</label>
          <select
            className="select"
            value={formValues.stage}
            onChange={(e) => setField('stage', e.target.value as MemberFormValues['stage'])}
          >
            <option value="">Tự tính theo ngày sinh</option>
            <option value="thieu_nien">Thiếu niên</option>
            <option value="thanh_nien">Thanh niên</option>
            <option value="thanh_trang">Thanh tráng</option>
          </select>
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
          <label className="field-label">Số điện thoại phụ</label>
          <input className="input" value={formValues.phone2} onChange={(e) => setField('phone2', e.target.value)} />
        </div>
        <div className="field span-2">
          <label className="field-label">Địa chỉ</label>
          <input
            className="input"
            placeholder="Số nhà, đường, phường, quận"
            value={formValues.address}
            onChange={(e) => setField('address', e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label">Ngành nghề / ngành học</label>
          <input
            className="input"
            placeholder="VD: Kỹ sư phần mềm, Sinh viên Y khoa"
            value={formValues.occupation}
            onChange={(e) => setField('occupation', e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label">Nơi làm việc / trường</label>
          <input className="input" value={formValues.workplace} onChange={(e) => setField('workplace', e.target.value)} />
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
