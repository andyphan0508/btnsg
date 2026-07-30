import {
  computeAge,
  computeMembershipYears,
  computeStage,
  MEMBER_STAGE_LABELS,
  type Member,
  type MemberStage,
} from '@btnsg/shared';
import EmptyState from '../../../ui/EmptyState';
import { formatDate } from '../../../utils/format';
import { FiUsers } from 'react-icons/fi';

type MemberTableProps = {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
};

const STAGE_BADGES: Record<MemberStage, string> = {
  thieu_nien: 'badge-blue',
  thanh_nien: 'badge-green',
  thanh_trang: 'badge-amber',
};

const MemberTable = ({ members, onEdit, onDelete }: MemberTableProps) => {
  if (members.length === 0) {
    return (
      <div className="table-wrap">
        <EmptyState icon={<FiUsers />} title="Chưa có thành viên nào" hint="Bấm “Thêm thành viên” hoặc “Import Excel” để bắt đầu." />
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Tuổi</th>
            <th>Vai trò</th>
            <th>Nhiệm vụ</th>
            <th>Liên hệ</th>
            <th>Tham gia</th>
            <th>Trạng thái</th>
            <th style={{ textAlign: 'right' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const age = computeAge(member.birthday);
            const stage = computeStage(member);
            const membershipYears = computeMembershipYears(member.joinedAt);
            return (
              <tr key={member.id}>
                <td data-label="Họ tên">
                  <span className="cell-strong">{member.name}</span>
                  {member.group && <div className="cell-muted">Nhóm: {member.group}</div>}
                </td>
                <td data-label="Tuổi">
                  <div className="cell-muted">{age !== null ? `${age} tuổi` : '—'}</div>
                  {stage && <span className={`badge ${STAGE_BADGES[stage]}`}>{MEMBER_STAGE_LABELS[stage]}</span>}
                </td>
                <td data-label="Vai trò">
                  {member.role === 'leader' ? (
                    <span className="badge badge-brand">{member.boardRole ?? 'Ban Điều Hành'}</span>
                  ) : (
                    <span className="badge badge-grey">Ban viên</span>
                  )}
                </td>
                <td data-label="Nhiệm vụ">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {member.duties.length === 0 && <span className="cell-muted">—</span>}
                    {member.duties.map((duty) => (
                      <span className="badge badge-grey" key={duty}>{duty}</span>
                    ))}
                  </div>
                </td>
                <td data-label="Liên hệ">
                  <div className="cell-muted">{member.phone ?? '—'}</div>
                  <div className="cell-muted">{member.email ?? ''}</div>
                </td>
                <td data-label="Tham gia">
                  <div className="cell-muted">{formatDate(member.joinedAt)}</div>
                  {membershipYears !== null && <div className="cell-muted">{membershipYears} năm</div>}
                </td>
                <td data-label="Trạng thái">
                  {member.status === 'active' ? (
                    <span className="badge badge-green">Đang sinh hoạt</span>
                  ) : (
                    <span className="badge badge-red">Tạm vắng</span>
                  )}
                </td>
                <td>
                  <div className="cell-actions">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => onEdit(member)}>
                      Sửa
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(member)}>
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MemberTable;
