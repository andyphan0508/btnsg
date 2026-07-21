import { NavLink } from 'react-router-dom';
import logoImg from '../../assets/logobtnsg.jpg';
import { useAuth } from '../../auth/AuthContext';

type NavItem = {
  to: string;
  label: string;
  icon: JSX.Element;
};

const ICON_PROPS = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 } as const;

const MAIN_NAV: NavItem[] = [
  {
    to: '/',
    label: 'Tổng quan',
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/thanh-vien',
    label: 'Thành viên',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: '/diem-danh',
    label: 'Điểm danh',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    to: '/lich-sinh-hoat',
    label: 'Lịch sinh hoạt',
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

const WORK_NAV: NavItem[] = [
  {
    to: '/cong-viec',
    label: 'Công việc',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    to: '/thong-bao',
    label: 'Thông báo',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    to: '/de-xuat',
    label: 'Đề xuất / Request',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="13" x2="13" y2="13" />
      </svg>
    ),
  },
  {
    to: '/thu-chi',
    label: 'Thu chi',
    icon: (
      <svg {...ICON_PROPS}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    to: '/ke-hoach',
    label: 'Kế hoạch',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
      </svg>
    ),
  },
  {
    to: '/email-bdh',
    label: 'Email BĐH',
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 7l-10 6L2 7" />
      </svg>
    ),
  },
];

const ADMIN_NAV: NavItem[] = [
  {
    to: '/tai-khoan',
    label: 'Tài khoản',
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 0 0-16 0" />
        <path d="M19 8l1.5 1.5M22 6l-1.5.5" />
      </svg>
    ),
  },
];

const Sidebar = () => {
  const styles = createStyles();
  const { isAdmin } = useAuth();

  const renderLink = (item: NavItem) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
    >
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={logoImg} alt="Logo BTNSG" className="sidebar-logo" />
        <div style={styles.brandText}>
          <div className="sidebar-brand-name">Ban Thanh Niên</div>
          <div className="sidebar-brand-sub">Dashboard</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Cộng đồng</div>
        {MAIN_NAV.map(renderLink)}
        <div className="sidebar-section-label">Điều hành</div>
        {WORK_NAV.map(renderLink)}
        {isAdmin && (
          <>
            <div className="sidebar-section-label">Quản trị</div>
            {ADMIN_NAV.map(renderLink)}
          </>
        )}
      </nav>
      <div className="sidebar-foot">HTTL Sài Gòn · Từ 1942</div>
    </aside>
  );
};

export default Sidebar;

const createStyles = () => {
  return {
    brandText: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 2,
    },
  };
};
