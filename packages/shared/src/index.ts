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
  /** Số điện thoại phụ / liên hệ khi khẩn cấp. */
  phone2?: string;
  /** Địa chỉ nơi ở hiện tại. */
  address?: string;
  /** Nghề nghiệp hoặc ngành đang học. */
  occupation?: string;
  /** Nơi làm việc / trường đang theo học. */
  workplace?: string;
  role: MemberRole;
  boardRole?: string;
  /** Công tác đang đảm nhiệm trong Ban (uỷ viên, hậu cần, ban đàn…). */
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

/** Hình thức thanh toán của một giao dịch. */
export type PaymentMethod = "cash" | "transfer" | "other";

export type Expense = {
  id: string;
  date: string;
  type: ExpenseType;
  category: string;
  amount: number;
  note?: string;
  /** Hạng mục con — chi tiết hoá bên trong hạng mục lớn. */
  subCategory?: string;
  /** Số phiếu / số chứng từ (VD: PC-2026-001). */
  receiptNo?: string;
  paymentMethod?: PaymentMethod;
  /** Người nộp (khoản thu) hoặc người nhận (khoản chi). */
  counterparty?: string;
  /** Người ghi nhận / thủ quỹ chi tiền. */
  handledBy?: string;
  /** Thuộc hoạt động - sự kiện nào (VD: Trại hè 2026). */
  eventName?: string;
  /** Link ảnh chụp hoá đơn / chứng từ (Drive, ảnh…). */
  attachmentUrl?: string;
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

/** Gợi ý hạng mục con cho từng hạng mục lớn (người dùng vẫn gõ tự do được). */
export const EXPENSE_SUBCATEGORIES: Record<string, string[]> = {
  "Quỹ ban": ["Dâng hiến hằng tuần", "Đóng góp ban viên", "Ủng hộ từ Hội Thánh", "Lãi ngân hàng"],
  "Truyền giảng": ["In ấn tờ rơi", "Âm thanh - ánh sáng", "Quà tặng thân hữu", "Trang trí", "Nước uống"],
  "Công tác xã hội": ["Quà từ thiện", "Chi phí đi lại", "Vật phẩm cứu trợ", "Hỗ trợ hoàn cảnh khó khăn"],
  "Sinh hoạt - dã ngoại": ["Thuê xe", "Ăn uống", "Thuê địa điểm", "Trò chơi - giải thưởng", "Vé tham quan"],
  "Thăm viếng": ["Quà thăm viếng", "Xăng xe", "Hoa - trái cây"],
  "Cơ sở vật chất": ["Nhạc cụ", "Thiết bị âm thanh", "Bàn ghế", "Sửa chữa", "Văn phòng phẩm"],
  Khác: ["Tạm ứng", "Hoàn ứng", "Phát sinh"],
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Tiền mặt",
  transfer: "Chuyển khoản",
  other: "Khác",
};

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

/* ============================================================
   Thống kê thu chi & tiện ích cho phiếu chi
   ============================================================ */

export type FinancePeriod = "day" | "month" | "year";

export type FinanceBucket = {
  /** Khoá sắp xếp: yyyy-MM-dd | yyyy-MM | yyyy */
  key: string;
  /** Nhãn hiển thị tiếng Việt */
  label: string;
  income: number;
  expense: number;
  balance: number;
  count: number;
};

export type FinanceTotals = {
  income: number;
  expense: number;
  balance: number;
  count: number;
};

/** Tổng thu, tổng chi, số dư của một tập giao dịch. */
export const summarizeExpenses = (expenses: Expense[]): FinanceTotals => {
  let income = 0;
  let expense = 0;
  for (const item of expenses) {
    if (item.type === "income") income += item.amount;
    else expense += item.amount;
  }
  return { income, expense, balance: income - expense, count: expenses.length };
};

const periodKey = (date: string, period: FinancePeriod): string => {
  if (period === "year") return date.slice(0, 4);
  if (period === "month") return date.slice(0, 7);
  return date.slice(0, 10);
};

const periodLabel = (key: string, period: FinancePeriod): string => {
  if (period === "year") return `Năm ${key}`;
  if (period === "month") {
    const [year, month] = key.split("-");
    return `Tháng ${Number(month)}/${year}`;
  }
  const [year, month, day] = key.split("-");
  return `${Number(day)}/${Number(month)}/${year}`;
};

/**
 * Gom giao dịch theo ngày / tháng / năm, sắp xếp tăng dần theo thời gian.
 * `limit` giữ lại N kỳ gần nhất (bỏ qua nếu không truyền).
 */
export const groupByPeriod = (
  expenses: Expense[],
  period: FinancePeriod,
  limit?: number,
): FinanceBucket[] => {
  const map = new Map<string, FinanceBucket>();

  for (const item of expenses) {
    if (!item.date) continue;
    const key = periodKey(item.date, period);
    let bucket = map.get(key);
    if (!bucket) {
      bucket = { key, label: periodLabel(key, period), income: 0, expense: 0, balance: 0, count: 0 };
      map.set(key, bucket);
    }
    if (item.type === "income") bucket.income += item.amount;
    else bucket.expense += item.amount;
    bucket.balance = bucket.income - bucket.expense;
    bucket.count += 1;
  }

  const buckets = [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  return limit && buckets.length > limit ? buckets.slice(-limit) : buckets;
};

export type CategoryBucket = {
  category: string;
  amount: number;
  count: number;
  /** Tỷ trọng trên tổng (0–100). */
  percent: number;
};

/** Tổng hợp theo hạng mục cho một loại giao dịch (thu hoặc chi). */
export const summarizeByCategory = (expenses: Expense[], type: ExpenseType): CategoryBucket[] => {
  const map = new Map<string, { amount: number; count: number }>();
  let total = 0;

  for (const item of expenses) {
    if (item.type !== type) continue;
    const current = map.get(item.category) ?? { amount: 0, count: 0 };
    current.amount += item.amount;
    current.count += 1;
    map.set(item.category, current);
    total += item.amount;
  }

  return [...map.entries()]
    .map(([category, value]) => ({
      category,
      amount: value.amount,
      count: value.count,
      percent: total > 0 ? (value.amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
};

/* ---------- Đọc số tiền bằng chữ (cho phiếu chi) ---------- */

const ONES = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

/** Đọc nhóm 3 chữ số; `full` = true khi còn nhóm lớn hơn phía trước (phải đọc đủ "không trăm"). */
const readTriple = (value: number, full: boolean): string => {
  const hundred = Math.floor(value / 100);
  const ten = Math.floor((value % 100) / 10);
  const unit = value % 10;
  const parts: string[] = [];

  if (hundred > 0 || full) parts.push(`${ONES[hundred]} trăm`);

  if (ten > 1) {
    parts.push(`${ONES[ten]} mươi`);
    if (unit === 1) parts.push("mốt");
    else if (unit === 5) parts.push("lăm");
    else if (unit > 0) parts.push(ONES[unit]);
  } else if (ten === 1) {
    parts.push("mười");
    if (unit === 5) parts.push("lăm");
    else if (unit > 0) parts.push(ONES[unit]);
  } else if (unit > 0) {
    if (hundred > 0 || full) parts.push("lẻ");
    parts.push(ONES[unit]);
  }

  return parts.join(" ");
};

const SCALES = ["", " nghìn", " triệu", " tỷ"];

/** "1.250.000" → "Một triệu hai trăm năm mươi nghìn đồng". */
export const amountToWords = (amount: number): string => {
  const rounded = Math.floor(Math.abs(amount));
  if (rounded === 0) return "Không đồng";

  const triples: number[] = [];
  let rest = rounded;
  while (rest > 0) {
    triples.push(rest % 1000);
    rest = Math.floor(rest / 1000);
  }

  const words: string[] = [];
  for (let i = triples.length - 1; i >= 0; i -= 1) {
    if (triples[i] === 0) continue;
    // Nhóm không phải nhóm đầu tiên phải đọc đủ "không trăm ..."
    words.push(readTriple(triples[i], i !== triples.length - 1) + (SCALES[i] ?? ""));
  }

  const text = words.join(" ").replace(/\s+/g, " ").trim();
  return `${text.charAt(0).toUpperCase()}${text.slice(1)} đồng`;
};
