/* ============================================================
   @btnsg/shared — Types dùng chung giữa API và Dashboard
   ============================================================ */

/* ---------- Thành viên & nhân sự ---------- */
export type MemberRole = "member" | "leader";
export type MemberStatus = "active" | "inactive";

/** Giai đoạn sinh hoạt: thiếu niên (<18), thanh niên (18–30), thanh tráng (>30). */
export type MemberStage = "thieu_nien" | "thanh_nien" | "thanh_trang";

export type Member = {
  id: string;
  name: string;
  gender?: "nam" | "nu";
  birthday?: string;
  phone?: string;
  email?: string;
  role: MemberRole;
  boardRole?: string;
  duties: string[];
  group?: string;
  joinedAt?: string;
  status: MemberStatus;
  /** Ghi đè thủ công; nếu bỏ trống sẽ tự suy ra từ ngày sinh. */
  stage?: MemberStage;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

/* ---------- Điểm danh ---------- */
export type AttendanceStatus = "present" | "absent" | "excused";

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
export type ScheduleRecurrence = "weekly" | "once";

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
export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "low" | "medium" | "high";

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
export type RequestStatus =
  | "open"
  | "in_review"
  | "approved"
  | "rejected"
  | "done";

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
export type ExpenseType = "income" | "expense";

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
export type PlanStatus = "draft" | "active" | "done";

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

/* ---------- Tài khoản & phân quyền ---------- */
export type ProfileRole = "admin" | "bdh";

export type Profile = {
  id: string;
  email: string;
  fullName: string;
  role: ProfileRole;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
};

/* ---------- Template email BĐH ---------- */
export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  /** Nội dung có placeholder dạng {{ten_truong}}. */
  body: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

/* ---------- Lịch sử thay đổi thành viên ---------- */
export type MemberChangeAction = "create" | "update" | "delete";

export type MemberFieldChange = {
  field: string;
  from?: string;
  to?: string;
};

export type MemberChange = {
  id: string;
  memberId: string;
  memberName: string;
  action: MemberChangeAction;
  changes: MemberFieldChange[];
  actorName?: string;
  createdAt: string;
  updatedAt: string;
};

/* ---------- Thống kê tổng quan ---------- */
export type OverviewStats = {
  totalMembers: number;
  activeMembers: number;
  leaderCount: number;
  attendanceRate: number;
  recentSessions: {
    id: string;
    date: string;
    title: string;
    presentCount: number;
    totalCount: number;
  }[];
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
  "Chúa Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
] as const;

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Có mặt",
  absent: "Vắng",
  excused: "Vắng phép",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Cần làm",
  doing: "Đang làm",
  done: "Hoàn thành",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  open: "Mới",
  in_review: "Đang xem xét",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  done: "Hoàn tất",
};

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  draft: "Nháp",
  active: "Đang thực hiện",
  done: "Hoàn thành",
};

export const EXPENSE_CATEGORIES = [
  "Quỹ ban",
  "Truyền giảng",
  "Công tác xã hội",
  "Sinh hoạt - dã ngoại",
  "Thăm viếng",
  "Cơ sở vật chất",
  "Khác",
] as const;

export const MEMBER_STAGE_LABELS: Record<MemberStage, string> = {
  thieu_nien: "Thiếu niên",
  thanh_nien: "Thanh niên",
  thanh_trang: "Thanh tráng",
};

export const PROFILE_ROLE_LABELS: Record<ProfileRole, string> = {
  admin: "Quản trị",
  bdh: "Ban Điều Hành",
};

/* ============================================================
   Tính tuổi, năm tham gia & cảnh báo chuyển giai đoạn
   ============================================================ */

/** Mốc tuổi lên thanh niên (đủ 18) và lên thanh tráng (qua 30). */
export const STAGE_UP_AGE = 18;
export const STAGE_OUT_AGE = 30;

/** Số năm báo trước khi thành viên chạm mốc tuổi. */
export const TRANSITION_NOTICE_YEARS = 1;

const parseDateSafe = (value?: string): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Tuổi hiện tại tính đủ theo ngày sinh; null nếu không có ngày sinh hợp lệ. */
export const computeAge = (
  birthday?: string,
  at: Date = new Date(),
): number | null => {
  const birth = parseDateSafe(birthday);
  if (!birth) return null;
  let age = at.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    at.getMonth() < birth.getMonth() ||
    (at.getMonth() === birth.getMonth() && at.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
};

/** Số năm đã tham gia (tròn năm) tính từ ngày gia nhập. */
export const computeMembershipYears = (
  joinedAt?: string,
  at: Date = new Date(),
): number | null => {
  const joined = parseDateSafe(joinedAt);
  if (!joined) return null;
  let years = at.getFullYear() - joined.getFullYear();
  const beforeAnniversary =
    at.getMonth() < joined.getMonth() ||
    (at.getMonth() === joined.getMonth() && at.getDate() < joined.getDate());
  if (beforeAnniversary) years -= 1;
  return Math.max(years, 0);
};

/** Năm dương lịch mà thành viên đủ `age` tuổi (tính theo năm sinh). */
export const yearTurningAge = (
  birthday: string | undefined,
  age: number,
): number | null => {
  const birth = parseDateSafe(birthday);
  if (!birth) return null;
  return birth.getFullYear() + age;
};

/** Giai đoạn suy ra từ ngày sinh (ưu tiên stage đặt thủ công nếu có). */
export const computeStage = (
  member: Pick<Member, "birthday" | "stage">,
  at: Date = new Date(),
): MemberStage | null => {
  if (member.stage) return member.stage;
  const age = computeAge(member.birthday, at);
  if (age === null) return null;
  if (age < STAGE_UP_AGE) return "thieu_nien";
  if (age <= STAGE_OUT_AGE) return "thanh_nien";
  return "thanh_trang";
};

export type TransitionAlert = {
  member: Member;
  /** Năm chạm mốc tuổi (đủ 18 hoặc đủ 30). */
  year: number;
  /** Tuổi mốc tương ứng: 18 (lên thanh niên) hoặc 30 (lên thanh tráng). */
  milestoneAge: number;
};

export type TransitionAlerts = {
  /** Thanh niên đủ 30 tuổi trong năm nay hoặc năm sau → chuẩn bị lên thanh tráng. */
  toThanhTrang: TransitionAlert[];
  /** Thiếu niên đủ 18 tuổi trong năm nay hoặc năm sau → chuẩn bị lên thanh niên. */
  toThanhNien: TransitionAlert[];
};

/**
 * Danh sách cảnh báo chuyển giai đoạn, báo trước TRANSITION_NOTICE_YEARS năm.
 * Chỉ xét thành viên đang sinh hoạt (status = active) và có ngày sinh.
 */
export const computeTransitionAlerts = (
  members: Member[],
  at: Date = new Date(),
): TransitionAlerts => {
  const currentYear = at.getFullYear();
  const maxYear = currentYear + TRANSITION_NOTICE_YEARS;
  const toThanhTrang: TransitionAlert[] = [];
  const toThanhNien: TransitionAlert[] = [];

  for (const member of members) {
    if (member.status !== "active") continue;
    const stage = computeStage(member, at);
    if (stage === "thanh_nien") {
      const year = yearTurningAge(member.birthday, STAGE_OUT_AGE);
      if (year !== null && year >= currentYear && year <= maxYear) {
        toThanhTrang.push({ member, year, milestoneAge: STAGE_OUT_AGE });
      }
    } else if (stage === "thieu_nien") {
      const year = yearTurningAge(member.birthday, STAGE_UP_AGE);
      if (year !== null && year >= currentYear && year <= maxYear) {
        toThanhNien.push({ member, year, milestoneAge: STAGE_UP_AGE });
      }
    }
  }

  const byYearThenName = (a: TransitionAlert, b: TransitionAlert) =>
    a.year - b.year || a.member.name.localeCompare(b.member.name, "vi");
  toThanhTrang.sort(byYearThenName);
  toThanhNien.sort(byYearThenName);

  return { toThanhTrang, toThanhNien };
};

/** Lấy danh sách placeholder {{ten_bien}} trong template email. */
export const extractTemplateFields = (
  template: Pick<EmailTemplate, "subject" | "body">,
): string[] => {
  const source = `${template.subject}\n${template.body}`;
  const fields = new Set<string>();
  const pattern = /\{\{\s*([\w\d_]+)\s*\}\}/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source)) !== null) {
    fields.add(match[1]);
  }
  return [...fields];
};

/** Điền giá trị vào template, giữ nguyên placeholder chưa có giá trị. */
export const fillTemplate = (
  text: string,
  values: Record<string, string>,
): string => {
  return text.replace(/\{\{\s*([\w\d_]+)\s*\}\}/g, (raw, field: string) => {
    const value = values[field];
    return value !== undefined && value !== "" ? value : raw;
  });
};
