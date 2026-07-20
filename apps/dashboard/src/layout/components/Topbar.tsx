import { useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Tổng quan',
  '/thanh-vien': 'Quản lý thành viên & nhân sự',
  '/diem-danh': 'Điểm danh sinh hoạt',
  '/lich-sinh-hoat': 'Lịch sinh hoạt',
  '/cong-viec': 'Đầu mục công việc',
  '/thong-bao': 'Thông báo',
  '/de-xuat': 'Đề xuất / Request',
  '/thu-chi': 'Quản lý thu chi',
  '/ke-hoach': 'Kế hoạch',
};

const formatTodayLabel = (): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
};

const Topbar = () => {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-date">{formatTodayLabel()}</div>
    </header>
  );
};

export default Topbar;
