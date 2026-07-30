import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import type { IconType } from 'react-icons';
import {
  FiBell,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiDollarSign,
  FiFileText,
  FiGrid,
  FiHome,
  FiLogOut,
  FiMail,
  FiMessageSquare,
  FiSend,
  FiTarget,
  FiUserCheck,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { PROFILE_ROLE_LABELS } from '@btnsg/shared';
import { useAuth } from '../../auth/AuthContext';

type TabItem = { to: string; label: string; icon: IconType };

/** 4 mục hay dùng nhất nằm trên thanh; phần còn lại nằm trong sheet "Thêm". */
const MAIN_TABS: TabItem[] = [
  { to: '/', label: 'Tổng quan', icon: FiHome },
  { to: '/thanh-vien', label: 'Thành viên', icon: FiUsers },
  { to: '/thu-chi', label: 'Thu chi', icon: FiDollarSign },
  { to: '/cong-viec', label: 'Công việc', icon: FiClipboard },
];

const MORE_TABS: TabItem[] = [
  { to: '/diem-danh', label: 'Điểm danh', icon: FiCheckSquare },
  { to: '/lich-sinh-hoat', label: 'Lịch sinh hoạt', icon: FiCalendar },
  { to: '/thong-bao', label: 'Thông báo', icon: FiBell },
  { to: '/de-xuat', label: 'Đề xuất / Request', icon: FiMessageSquare },
  { to: '/ke-hoach', label: 'Kế hoạch', icon: FiTarget },
  { to: '/email-bdh', label: 'Email BĐH', icon: FiMail },
  { to: '/dang-bai', label: 'Đăng bài Tin tức', icon: FiFileText },
  { to: '/thong-bao-day', label: 'Thông báo đẩy', icon: FiSend },
];

const ADMIN_TABS: TabItem[] = [{ to: '/tai-khoan', label: 'Quản lý tài khoản', icon: FiUserCheck }];

/**
 * Thanh tab dưới cho màn hình nhỏ — thay cho sidebar.
 * Nút "Thêm" mở sheet chứa các mục còn lại + thông tin tài khoản.
 */
const MobileTabBar = () => {
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const location = useLocation();
  const { profile, isAdmin, isDemo, signOut } = useAuth();

  // Đổi trang thì đóng sheet
  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!sheetOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [sheetOpen]);

  const moreItems = isAdmin ? [...MORE_TABS, ...ADMIN_TABS] : MORE_TABS;
  const isOnMoreScreen = moreItems.some((item) => item.to === location.pathname);

  return (
    <>
      {sheetOpen && <div className="mtab-backdrop" onClick={() => setSheetOpen(false)} />}

      <div className={`mtab-sheet${sheetOpen ? ' open' : ''}`} role="dialog" aria-hidden={!sheetOpen}>
        <div className="mtab-sheet-handle" />
        <div className="mtab-sheet-head">
          <div>
            <div className="mtab-sheet-title">{profile?.fullName ?? 'Ban Điều Hành'}</div>
            <div className="mtab-sheet-sub">
              {isDemo ? 'Chế độ demo' : profile ? PROFILE_ROLE_LABELS[profile.role] : ''}
            </div>
          </div>
          <button
            type="button"
            className="mtab-sheet-close"
            onClick={() => setSheetOpen(false)}
            aria-label="Đóng"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="mtab-sheet-grid">
          {moreItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `mtab-sheet-item${isActive ? ' active' : ''}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {!isDemo && (
          <button type="button" className="btn btn-outline mtab-signout" onClick={() => signOut()}>
            <FiLogOut /> Đăng xuất
          </button>
        )}
      </div>

      <nav className="mobile-tabbar" aria-label="Điều hướng dashboard">
        {MAIN_TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) => `mtab-item${isActive ? ' active' : ''}`}
          >
            <tab.icon className="mtab-icon" />
            <span>{tab.label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className={`mtab-item mtab-more${sheetOpen || isOnMoreScreen ? ' active' : ''}`}
          onClick={() => setSheetOpen((open) => !open)}
          aria-expanded={sheetOpen}
        >
          <FiGrid className="mtab-icon" />
          <span>Thêm</span>
        </button>
      </nav>
    </>
  );
};

export default MobileTabBar;
