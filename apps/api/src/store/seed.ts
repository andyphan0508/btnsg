import {
  announcementsCol,
  attendanceCol,
  expensesCol,
  membersCol,
  plansCol,
  requestsCol,
  scheduleCol,
  tasksCol,
} from './collections.js';

const BOARD_SEED = [
  { name: 'Hoàng Nguyễn Phương Uyên', boardRole: 'Trưởng Ban', duties: ['Uỷ viên Linh vụ', 'Uỷ viên nhóm nhỏ'] },
  { name: 'Trần Nhật Kỳ', boardRole: 'Phó Ban', duties: ['Uỷ viên Công tác Xã hội', 'Quản lý Nhà sinh viên'] },
  { name: 'Trương Thị Thanh Ngân', boardRole: 'Thư ký', duties: ['Uỷ viên Đố Kinh Thánh'] },
  { name: 'Nguyễn Đặng Thiên Kim', boardRole: 'Thủ quỹ', duties: ['Hậu cần'] },
  { name: 'Nguyễn Văn Tới', boardRole: 'Uỷ viên Du lịch dã ngoại', duties: ['Uỷ viên Giữ xe'] },
  { name: 'Huỳnh Nguyên Bảo', boardRole: 'Uỷ viên Kỹ thuật', duties: ['Uỷ viên Thăm viếng Chăm sóc'] },
  { name: 'Bùi Tuấn Anh', boardRole: 'Nhóm trưởng', duties: ['Uỷ viên Truyền giảng'] },
  { name: 'Phan An Duy', boardRole: 'Nhóm trưởng', duties: ['Quản lý Tài sản'] },
  { name: 'Dương Thảo Nhi', boardRole: 'Nhóm trưởng', duties: ['Uỷ viên sinh hoạt'] },
  { name: 'Nguyễn Anh Thư', boardRole: 'Nhóm trưởng', duties: ['Uỷ viên Cầu nguyện'] },
  { name: 'Trần Thảo Anh', boardRole: 'Uỷ viên Âm nhạc', duties: ['Uỷ viên Truyền thông'] },
];

const SCHEDULE_SEED = [
  {
    title: 'Nhóm thờ phượng Chúa',
    recurrence: 'weekly' as const,
    dayOfWeek: 0,
    time: '14:30',
    location: 'Lầu 2, 161 Đề Thám, Quận 1',
    description: 'Buổi nhóm chính trong tuần — dành cho mọi bạn trẻ.',
    isMain: true,
  },
  {
    title: 'Học Kinh Thánh',
    recurrence: 'weekly' as const,
    dayOfWeek: 2,
    time: '19:00',
    location: 'Phòng sinh hoạt Ban Thanh Niên',
    description: 'Cùng đào sâu Lời Chúa giữa tuần.',
  },
  {
    title: 'Thăm viếng',
    recurrence: 'weekly' as const,
    dayOfWeek: 4,
    time: '19:00',
    description: 'Tuần thứ 2 và thứ 3 mỗi tháng.',
  },
  {
    title: 'Ban Điều Hành cầu nguyện',
    recurrence: 'weekly' as const,
    dayOfWeek: 6,
    time: '18:30',
    description: 'Cầu thay cho công việc của Ban.',
  },
  {
    title: 'Tập hát',
    recurrence: 'weekly' as const,
    dayOfWeek: 6,
    time: '19:30',
    description: 'Chuẩn bị tôn vinh Chúa cho Chúa Nhật.',
  },
];

export const seedDatabase = (): void => {
  membersCol.seedIfEmpty(
    BOARD_SEED.map((m) => ({
      name: m.name,
      role: 'leader' as const,
      boardRole: m.boardRole,
      duties: m.duties,
      status: 'active' as const,
      joinedAt: '2004-01-01',
    })),
  );

  scheduleCol.seedIfEmpty(SCHEDULE_SEED);

  announcementsCol.seedIfEmpty([
    {
      title: 'Chào mừng đến với Dashboard Ban Thanh Niên',
      content:
        'Đây là hệ thống quản lý nội bộ của Ban Thanh Niên HTTL Sài Gòn: quản lý thành viên, điểm danh, lịch sinh hoạt, công việc, thu chi và kế hoạch. Hãy bắt đầu bằng cách thêm các ban viên vào mục Thành viên.',
      pinned: true,
      author: 'Ban Điều Hành',
    },
  ]);

  plansCol.seedIfEmpty([
    {
      title: 'Chủ đề năm 2026 — Môn Đồ Chúa Cứu Thế',
      goal: 'Định hướng sinh hoạt cả năm theo chủ đề, câu gốc II Ti-mô-thê 3:14-15 và bài hát TC 356.',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      status: 'active' as const,
      items: [
        { id: crypto.randomUUID(), text: 'Phổ biến chủ đề năm đến toàn ban viên', done: true },
        { id: crypto.randomUUID(), text: 'Lên lịch bồi linh quý 3', done: false },
        { id: crypto.randomUUID(), text: 'Chuẩn bị kỳ truyền giảng cuối năm', done: false },
      ],
    },
  ]);

  // Các collection còn lại khởi đầu rỗng: attendance, tasks, requests, expenses
  void attendanceCol;
  void tasksCol;
  void requestsCol;
  void expensesCol;
};
