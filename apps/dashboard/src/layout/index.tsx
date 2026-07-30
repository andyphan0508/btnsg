import { Outlet } from 'react-router-dom';
import MobileTabBar from './components/MobileTabBar';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

const DashboardLayout = () => {
  return (
    <div className="shell">
      {/* Sidebar cho màn hình lớn — CSS tự ẩn trên mobile, nhường chỗ cho thanh tab dưới */}
      <Sidebar />
      <div className="shell-main">
        <Topbar />
        <main className="shell-content">
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
};

export default DashboardLayout;
