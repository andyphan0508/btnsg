import { FiClock, FiDownload, FiUpload } from 'react-icons/fi';
export type MemberSortKey = 'name' | 'group' | 'age' | 'membershipYears' | 'joinedAt';

type MemberFiltersProps = {
  searchKeyword: string;
  roleFilter: string;
  statusFilter: string;
  groupFilter: string;
  stageFilter: string;
  sortKey: MemberSortKey;
  groupOptions: string[];
  historyOpen: boolean;
  canEdit: boolean;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onGroupChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onSortChange: (value: MemberSortKey) => void;
  onToggleHistory: () => void;
  onImportClick: () => void;
  onExportClick: () => void;
  onAddClick: () => void;
};

const MemberFilters = ({
  searchKeyword,
  roleFilter,
  statusFilter,
  groupFilter,
  stageFilter,
  sortKey,
  groupOptions,
  historyOpen,
  canEdit,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onGroupChange,
  onStageChange,
  onSortChange,
  onToggleHistory,
  onImportClick,
  onExportClick,
  onAddClick,
}: MemberFiltersProps) => {
  return (
    <>
      <div className="toolbar">
        <input
          className="input"
          placeholder="Tìm theo tên, SĐT, email…"
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <select className="select" value={roleFilter} onChange={(e) => onRoleChange(e.target.value)}>
          <option value="all">Tất cả vai trò</option>
          <option value="leader">Ban Điều Hành</option>
          <option value="member">Ban viên</option>
        </select>
        <select className="select" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang sinh hoạt</option>
          <option value="inactive">Tạm vắng</option>
        </select>
        <select className="select" value={groupFilter} onChange={(e) => onGroupChange(e.target.value)}>
          <option value="all">Tất cả nhóm nhỏ</option>
          {groupOptions.map((group) => (
            <option key={group} value={group}>Nhóm {group}</option>
          ))}
          <option value="none">Chưa có nhóm</option>
        </select>
        <select className="select" value={stageFilter} onChange={(e) => onStageChange(e.target.value)}>
          <option value="all">Tất cả giai đoạn</option>
          <option value="thieu_nien">Thiếu niên</option>
          <option value="thanh_nien">Thanh niên</option>
          <option value="thanh_trang">Thanh tráng</option>
        </select>
        <select className="select" value={sortKey} onChange={(e) => onSortChange(e.target.value as MemberSortKey)}>
          <option value="name">Sắp xếp: Tên A→Z</option>
          <option value="group">Sắp xếp: Nhóm nhỏ</option>
          <option value="age">Sắp xếp: Tuổi giảm dần</option>
          <option value="membershipYears">Sắp xếp: Năm tham gia nhiều nhất</option>
          <option value="joinedAt">Sắp xếp: Mới tham gia</option>
        </select>
      </div>
      <div className="toolbar">
        <button type="button" className={`btn ${historyOpen ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={onToggleHistory}>
          <FiClock /> Lịch sử thay đổi
        </button>
        <div className="toolbar-spacer" />
        <button type="button" className="btn btn-outline btn-sm" onClick={onExportClick}>
          <FiDownload /> Xuất Excel
        </button>
        {canEdit && (
          <>
            <button type="button" className="btn btn-outline btn-sm" onClick={onImportClick}>
              <FiUpload /> Import Excel
            </button>
            <button type="button" className="btn btn-primary" onClick={onAddClick}>
              + Thêm thành viên
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default MemberFilters;
