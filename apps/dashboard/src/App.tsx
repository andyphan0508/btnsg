import { Route, Routes } from 'react-router-dom';
import DashboardLayout from './layout';
import AnnouncementsScreen from './screens/Announcements';
import AttendanceScreen from './screens/Attendance';
import FinanceScreen from './screens/Finance';
import MembersScreen from './screens/Members';
import OverviewScreen from './screens/Overview';
import PlansScreen from './screens/Plans';
import RequestsScreen from './screens/Requests';
import ScheduleScreen from './screens/Schedule';
import TasksScreen from './screens/Tasks';

export default function App() {
  return (
    <Routes>
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
      </Route>
    </Routes>
  );
}
