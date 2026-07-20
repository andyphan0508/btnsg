type MemberFiltersProps = {
  searchKeyword: string;
  roleFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAddClick: () => void;
};

const MemberFilters = ({
  searchKeyword,
  roleFilter,
  statusFilter,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onAddClick,
}: MemberFiltersProps) => {
  return (
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
      <div className="toolbar-spacer" />
      <button type="button" className="btn btn-primary" onClick={onAddClick}>
        + Thêm thành viên
      </button>
    </div>
  );
};

export default MemberFilters;
