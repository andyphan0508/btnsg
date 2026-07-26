import { useLocation } from 'react-router-dom';
import { PROFILE_ROLE_LABELS } from '@btnsg/shared';
import { useAuth } from '../../auth/AuthContext';

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
  '/email-bdh': 'Gửi email Ban Điều Hành',
  '/dang-bai': 'Đăng bài Tin tức',
  '/thong-bao-day': 'Thông báo đẩy',
  '/tai-khoan': 'Quản lý tài khoản',
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
  const { profile, isDemo, signOut } = useAuth();
  const title = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div style={styles.right}>
        <div className="topbar-date">{formatTodayLabel()}</div>
        {profile && (
          <div style={styles.user}>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{profile.fullName}</span>
              <span className={`badge ${profile.role === 'admin' ? 'badge-brand' : 'badge-blue'}`}>
                {isDemo ? 'Demo' : PROFILE_ROLE_LABELS[profile.role]}
              </span>
            </div>
            {!isDemo && (
              <button className="btn btn-ghost btn-sm" onClick={() => signOut()} title="Đăng xuất">
                Đăng xuất
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;

const styles = {
  right: { display: 'flex', alignItems: 'center', gap: 16 },
  user: { display: 'flex', alignItems: 'center', gap: 10 },
  userInfo: { display: 'flex', alignItems: 'center', gap: 8 },
  userName: { fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)' },
};
