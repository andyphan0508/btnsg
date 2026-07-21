import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PendingApproval = () => {
  const { profile, signOut } = useAuth();
  return (
    <div style={pendingStyles.wrap}>
      <div className="card" style={pendingStyles.card}>
        <h2 style={{ fontSize: '1.15rem' }}>Tài khoản đang chờ duyệt</h2>
        <p style={pendingStyles.text}>
          Tài khoản <strong>{profile?.email}</strong> đã được tạo nhưng chưa được Quản trị viên phê duyệt.
          Vui lòng liên hệ Trưởng ban / Quản trị viên để được cấp quyền truy cập.
        </p>
        <button className="btn btn-outline" onClick={() => signOut()}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

/** Chặn toàn bộ dashboard: chưa đăng nhập → /dang-nhap; chưa duyệt → màn hình chờ. */
export const RequireAuth = () => {
  const { loading, isAuthenticated, profile } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/dang-nhap" replace />;
  if (!profile?.approved) return <PendingApproval />;
  return <Outlet />;
};

/** Chỉ cho Quản trị viên (admin) đi tiếp. */
export const RequireAdmin = () => {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
};

const pendingStyles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--paper)',
    padding: 20,
  },
  card: { maxWidth: 420, display: 'flex', flexDirection: 'column' as const, gap: 12 },
  text: { color: 'var(--ink-2)', fontSize: '0.9rem', lineHeight: 1.6 },
};
