import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAdmin, RequireAuth } from './auth/guards';
import DashboardLayout from './layout';
import AccountsScreen from './screens/Accounts';
import AnnouncementsScreen from './screens/Announcements';
import AttendanceScreen from './screens/Attendance';
import EmailScreen from './screens/Email';
import FinanceScreen from './screens/Finance';
import LoginScreen from './screens/Login';
import MembersScreen from './screens/Members';
import NewsScreen from './screens/News';
import OverviewScreen from './screens/Overview';
import PlansScreen from './screens/Plans';
import RequestsScreen from './screens/Requests';
import ScheduleScreen from './screens/Schedule';
import TasksScreen from './screens/Tasks';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/dang-nhap" element={<LoginScreen />} />
        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<OverviewScreen />} />
            <Route path="/thanh-vien" element={<MembersScreen />} />
            <Route path="/diem-danh" element={<AttendanceScreen />} />
            <Route path="/lich-sinh-hoat" element={<ScheduleScreen />} />
            <Route path="/cong-viec" element={<TasksScreen />} />
            <Route path="/thong-bao" element={<AnnouncementsScreen />} />
            <Route path="/de-xuat" element={<RequestsScreen />} />
            <Route path="/thu-chi" element={<FinanceScreen />} />
            <Route path="/ke-hoach" element={<PlansScreen />} />
            <Route path="/email-bdh" element={<EmailScreen />} />
            <Route path="/dang-bai" element={<NewsScreen />} />
            <Route element={<RequireAdmin />}>
              <Route path="/tai-khoan" element={<AccountsScreen />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
