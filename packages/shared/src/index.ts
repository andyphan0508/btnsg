/* ============================================================
   @btnsg/shared — Types dùng chung giữa API và Dashboard
   ============================================================ */

/* ---------- Thành viên & nhân sự ---------- */
export type MemberRole = 'member' | 'leader';
export type MemberStatus = 'active' | 'inactive';

export type Member = {
  id: string;
  name: string;
  gender?: 'nam' | 'nu';
  birthday?: string;
  phone?: string;
  email?: string;
  role: MemberRole;
  boardRole?: string;
  duties: string[];
  group?: string;
  joinedAt?: string;
  status: MemberStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

/* ---------- Điểm danh ---------- */
export type AttendanceStatus = 'present' | 'absent' | 'excused';

export type AttendanceRecord = {
  memberId: string;
  status: AttendanceStatus;
  note?: string;
};

export type AttendanceSession = {
  id: string;
  date: string;
  title: string;
  scheduleEventId?: string;
  records: AttendanceRecord[];
  createdAt: string;
  updatedAt: string;
};

/* ---------- Lịch sinh hoạt ---------- */
export type ScheduleRecurrence = 'weekly' | 'once';

export type ScheduleEvent = {
  id: string;
  title: string;
  recurrence: ScheduleRecurrence;
  dayOfWeek?: number;
  date?: string;
  time: string;
  location?: string;
  description?: string;
  isMain?: boolean;
  createdAt: string;
  updatedAt: string;
};

/* ---------- Thông báo ---------- */
export type Announcement = {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  author?: string;
  createdAt: string;
  updatedAt: string;
};

/* ---------- Đầu mục công việc ---------- */
export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskItem = {
  id: string;
  title: string;
  description?: string;
  assigneeIds: string[];
  dueDate?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
};

/* ---------- Request / đề xuất ---------- */
export type RequestStatus = 'open' | 'in_review' | 'approved' | 'rejected' | 'done';

export type RequestItem = {
  id: string;
  title: string;
  content: string;
  requesterName: string;
  status: RequestStatus;
  response?: string;
  createdAt: string;
  updatedAt: string;
};

/* ---------- Thu chi ---------- */
export type ExpenseType = 'income' | 'expense';

export type Expense = {
  id: string;
  date: string;
  type: ExpenseType;
  category: string;
  amount: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

/* ---------- Kế hoạch ---------- */
export type PlanStatus = 'draft' | 'active' | 'done';

export type PlanChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

export type Plan = {
  id: string;
  title: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  status: PlanStatus;
  items: PlanChecklistItem[];
  createdAt: string;
  updatedAt: string;
};

/* ---------- Thống kê tổng quan ---------- */
export type OverviewStats = {
  totalMembers: number;
  activeMembers: number;
  leaderCount: number;
  attendanceRate: number;
  recentSessions: { id: string; date: string; title: string; presentCount: number; totalCount: number }[];
  openTasks: number;
  doneTasks: number;
  openRequests: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  upcomingEvents: ScheduleEvent[];
  pinnedAnnouncements: Announcement[];
};

/* ---------- API envelope ---------- */
export type ApiResult<T> = {
  data: T;
};

export type ApiError = {
  error: string;
};

/* ---------- Nhãn hiển thị dùng chung ---------- */
export const DAY_OF_WEEK_LABELS = [
  'Chúa Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
] as const;

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Có mặt',
  absent: 'Vắng',
  excused: 'Vắng phép',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Cần làm',
  doing: 'Đang làm',
  done: 'Hoàn thành',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  open: 'Mới',
  in_review: 'Đang xem xét',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  done: 'Hoàn tất',
};

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  draft: 'Nháp',
  active: 'Đang thực hiện',
  done: 'Hoàn thành',
};

export const EXPENSE_CATEGORIES = [
  'Quỹ ban',
  'Truyền giảng',
  'Công tác xã hội',
  'Sinh hoạt - dã ngoại',
  'Thăm viếng',
  'Cơ sở vật chất',
  'Khác',
] as const;
