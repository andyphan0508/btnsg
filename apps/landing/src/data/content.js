export const site = {
  brand: "Ban Thanh Niên",
  brandCity: "Sài Gòn",
  church: "Hội Thánh Tin Lành Việt Nam · Chi Hội Sài Gòn · Từ 1942",
  title: "Ban Thanh Niên",
  tagline:
    "Nơi người trẻ gặp gỡ Chúa, gắn kết cộng đồng và sống cho điều cao đẹp.",
  mission: "TẤT CẢ VÌ NGƯỜI CHƯA ĐƯỢC CỨU",
  facebook: "https://www.facebook.com/banthanhnienhttlsaigon",
};

/** Điều hướng chính — mỗi mục là một trang riêng (routing, không cuộn trong trang). */
export const nav = [
  { to: "/gioi-thieu", label: "Giới thiệu" },
  { to: "/chu-de", label: "Chủ đề năm" },
  { to: "/sinh-hoat", label: "Sinh hoạt" },
  { to: "/muc-vu", label: "Mục vụ" },
  { to: "/tin-tuc", label: "Tin tức" },
  { to: "/thu-vien", label: "Thư viện ảnh" },
  { to: "/lien-he", label: "Liên hệ" },
];

/**
 * 4 mục cố định trên thanh điều hướng dưới (mobile) — logo tròn chèn ở giữa
 * (2 mục trái, 2 mục phải). Các mục còn lại nằm trong sheet mở từ logo.
 */
export const bottomNav = [
  { to: "/", label: "Trang chủ", icon: "home" },
  { to: "/sinh-hoat", label: "Sinh hoạt", icon: "calendar" },
  { to: "/tin-tuc", label: "Tin tức", icon: "news" },
  { to: "/thu-vien", label: "Thư viện", icon: "image" },
];

/** Các mục hiện trong sheet khi bấm logo ở bottom nav. */
export const sheetNav = [
  { to: "/gioi-thieu", label: "Giới thiệu", desc: "Lịch sử & con số của Ban" },
  { to: "/chu-de", label: "Chủ đề năm", desc: "Câu gốc và định hướng năm nay" },
  { to: "/muc-vu", label: "Mục vụ", desc: "Các mảng phục vụ thường niên" },
  { to: "/lien-he", label: "Liên hệ", desc: "Địa chỉ, bản đồ, kết nối" },
];

const CHURCH_ADDRESS =
  "Hội Thánh Tin Lành Việt Nam Chi Hội Sài Gòn, 155 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh";

export const church = {
  name: "Nhà thờ Tin Lành Sài Gòn",
  address: "155 Trần Hưng Đạo, Phường Cầu Ông Lãnh, TP. Hồ Chí Minh",
  room: "Lầu 2, số 161 Đề Thám, Phường Cầu Ông Lãnh, TP. Hồ Chí Minh",
  mapEmbed: `https://www.google.com/maps?q=${encodeURIComponent(CHURCH_ADDRESS)}&hl=vi&z=17&output=embed`,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CHURCH_ADDRESS)}`,
};

/** Hai băng chữ chạy ở trang chủ: hàng kính + hàng nắng chạy ngược chiều. */
export const marquee = [
  ["Thờ phượng", "Lời Chúa", "Tình thân", "Âm nhạc", "Truyền giảng", "Phục vụ"],
  [
    "Tất cả vì người chưa được cứu",
    "Chúa Nhật · 14:30",
    "Từ 1942",
    "161 Đề Thám, Q.1",
    "Môn Đồ Chúa Cứu Thế",
  ],
];

export const stats = [
  { num: "200", label: "ban viên có tên trong danh sách" },
  { num: "60", label: "ban viên sinh hoạt thường xuyên" },
  { num: "11", label: "thành viên Ban Điều Hành (từ 2004)" },
];

export const nameTimeline = [
  {
    era: "1975 – 1983",
    name: "Ca đoàn 3",
    note: "Khởi đầu từ tiếng hát — phục vụ Chúa qua âm nhạc.",
  },
  {
    era: "1983 – 2002",
    name: "Ban Hát Lễ 3",
    note: "Tiếp nối di sản ca hát trong sự thờ phượng của Hội Thánh.",
  },
  {
    era: "2003 – nay",
    name: "Ban Thanh Niên",
    note: "Từ đầu thập niên 1990, Hội Đồng thường niên bầu chọn Ban Điều Hành; từ 2004 duy trì 11 thành viên.",
    current: true,
  },
];

export const themeYear = {
  eyebrow: "Chủ đề năm 2026",
  title: "Môn Đồ Chúa Cứu Thế",
  excerpt:
    "Về phần con, hãy đứng vững trong những điều con đã học và tin quyết…",
  song: "TC 271 — Ngài Dìu Dắt Tôi",
  verse:
    '"Về phần con, hãy đứng vững trong những điều con đã học và tin quyết, vì biết mình đã học những điều đó với ai, và từ khi thơ ấu con đã biết Kinh Thánh vốn có thể khiến con khôn ngoan để được cứu bởi đức tin trong Đấng Christ Jêsus."',
  ref: "II Ti-mô-thê 3:14-15",
  note: "Mỗi năm, Ban Thanh Niên chọn một chủ đề gắn với một câu Kinh Thánh gốc và một bài hát khẩu hiệu để định hướng sinh hoạt trong năm.",
};

export const schedule = [
  {
    day: "Chúa Nhật",
    time: "14:30",
    what: "Nhóm thờ phượng Chúa",
    note: "Buổi nhóm chính trong tuần — dành cho mọi bạn trẻ.",
    main: true,
    icon: "church",
    tone: "sun",
  },
  {
    day: "Thứ Ba",
    time: "19:00",
    what: "Học Kinh Thánh",
    note: "Cùng đào sâu Lời Chúa giữa tuần.",
    icon: "book",
    tone: "indigo",
  },
  {
    day: "Thứ Năm",
    time: "Buổi tối",
    what: "Thăm viếng",
    note: "Tuần thứ 2 và thứ 3 mỗi tháng.",
    icon: "visit",
    tone: "rose",
  },
  {
    day: "Thứ Bảy",
    time: "18:30",
    what: "Ban Điều Hành cầu nguyện",
    note: "Cầu thay cho công việc của Ban.",
    icon: "pray",
    tone: "violet",
  },
  {
    day: "Thứ Bảy",
    time: "19:30",
    what: "Tập hát",
    note: "Chuẩn bị tôn vinh Chúa cho Chúa Nhật.",
    icon: "music",
    tone: "amber",
  },
];

export const subCommittees = [
  {
    id: "nhom-truong",
    title: "Tiểu ban: Nhóm trưởng",
    icon: "leaders",
    desc: "Phụ trách các nhóm nhỏ trong Ban Thanh Niên — kèm cặp, cầu nguyện và chăm sóc thuộc linh cho từng ban viên theo nhóm.",
    hue: 24,
  },
  {
    id: "truyen-giang",
    title: "Tiểu ban: Truyền giảng",
    icon: "evangelism",
    desc: "Tổ chức các chương trình truyền giảng, chia sẻ Tin Lành cho bạn trẻ chưa tin Chúa — trọng tâm sứ mệnh của Ban.",
    hue: 200,
  },
  {
    id: "tham-vieng",
    title: "Tiểu ban: Thăm viếng",
    icon: "visit",
    desc: "Thăm hỏi, cầu nguyện và chăm sóc ban viên lúc đau ốm, khó khăn, hoặc mới đến sinh hoạt cùng Ban.",
    hue: 140,
  },
  {
    id: "am-nhac",
    title: "Tiểu ban: Âm nhạc – ca hát – ban đàn",
    icon: "music",
    desc: "Tập hát và chuẩn bị chương trình tôn vinh Chúa mỗi Chúa Nhật; ban đàn đệm nhạc cho các buổi nhóm trong tuần.",
    hue: 300,
  },
];

export const ministries = [
  {
    kind: "Thuộc linh",
    title: "Bồi linh",
    desc: "Chương trình bồi linh hằng năm gây dựng đời sống thuộc linh cho ban viên.",
    icon: "flame",
  },
  {
    kind: "Sứ mệnh",
    title: "Truyền giảng",
    desc: "Những chương trình truyền giảng chia sẻ Tin Lành cho người chưa tin — trọng tâm sứ mệnh của Hội Thánh.",
    icon: "megaphone",
  },
  {
    kind: "Cộng đồng",
    title: "Công tác xã hội",
    desc: "Chương trình gây dựng, xây dựng và giúp đỡ cộng đồng, kết nối với các Hội Thánh gặp khó khăn.",
    icon: "heart",
  },
  {
    kind: "Gắn kết",
    title: "Du lịch – dã ngoại",
    desc: "Những chuyến đi hằng năm để gắn kết tình thân giữa các ban viên, kết nối tình anh em trong Chúa.",
    icon: "compass",
  },
  {
    kind: "Đào tạo",
    title: "Huấn luyện",
    desc: "Đào tạo cho các tiểu ban: nhóm trưởng, truyền giảng, thăm viếng, âm nhạc, đào tạo các lớp kế thừa cho thế hệ tiếp theo.",
    icon: "training",
  },
  {
    kind: "Giao lưu",
    title: "Họp bạn Thanh Niên",
    desc: "Giao lưu, họp bạn với Ban Thanh Niên của các Hội Thánh bạn.",
    icon: "friends",
  },
];

export const duties = [
  {
    title: "Nhà trọ sinh viên",
    desc: "Quản lý hai nhà trọ sinh viên — chỗ ở và môi trường thuộc linh cho sinh viên xa nhà.",
    icon: "home",
  },
  {
    title: "Quầy sách Cơ Đốc",
    desc: "Phục vụ Hội Thánh qua việc quản lý quầy sách Cơ Đốc.",
    icon: "books",
  },
];

export const partners = [
  "Ban Phiên dịch",
  "Ban Trình chiếu",
  "Trường Chúa Nhật",
  "Ban Đàn",
  "Ban Trang trí",
  "Ban Âm thanh",
  "Ban Thiếu Nhi",
  "Ban Ấu Nhi",
];

export const contacts = [
  {
    title: "Hội Thánh Tin Lành Chi Hội Sài Gòn",
    desc: "155 Trần Hưng Đạo, Phường Cầu Ông Lãnh, TP. Hồ Chí Minh",
  },
  {
    title: "Phòng sinh hoạt Ban Thanh Niên",
    desc: "Lầu 2, số 161 Đề Thám, Phường Cầu Ông Lãnh, TP. Hồ Chí Minh",
  },
];

export const links = [
  {
    href: "https://www.facebook.com/banthanhnienhttlsaigon",
    label: "Facebook — Ban Thanh Niên HTTL Sài Gòn",
    short: "Facebook",
    icon: "facebook",
  },
  {
    href: "https://httlsaigon.org",
    label: "Website Hội Thánh — httlsaigon.org",
    short: "httlsaigon.org",
    icon: "web",
  },
  {
    href: "https://www.youtube.com/@BanThanhnienSaiGon",
    label: "YouTube Ban Thanh Niên",
    short: "YouTube",
    icon: "youtube",
  },
];

export const board = [
  {
    name: "Hoàng Nguyễn Phương Uyên",
    key: "uyen",
    role: "Trưởng Ban",
    duties: ["Uỷ viên Linh vụ", "Uỷ viên nhóm nhỏ"],
  },
  {
    name: "Trần Nhật Kỳ",
    key: "ky",
    role: "Phó Ban",
    duties: ["Uỷ viên Công tác Xã hội", "Quản lý Nhà sinh viên"],
  },
  {
    name: "Trương Thị Thanh Ngân",
    key: "ngan",
    role: "Thư ký",
    duties: ["Uỷ viên Đố Kinh Thánh"],
  },
  { name: "Nguyễn Đặng Thiên Kim", role: "Thủ quỹ", duties: ["Hậu cần"] },
  {
    name: "Nguyễn Văn Tới",
    key: "toi",
    role: "Uỷ viên Du lịch dã ngoại",
    duties: ["Uỷ viên Giữ xe"],
  },
  {
    name: "Huỳnh Nguyên Bảo",
    key: "bao",
    role: "Uỷ viên Kỹ thuật",
    duties: ["Uỷ viên Thăm viếng Chăm sóc"],
  },
  {
    name: "Bùi Tuấn Anh",
    key: "tuan",
    role: "Nhóm trưởng",
    duties: ["Uỷ viên Truyền giảng"],
  },
  { name: "Phan An Duy", role: "Nhóm trưởng", duties: ["Quản lý Tài sản"] },
  {
    name: "Dương Thảo Nhi",
    key: "nhi",
    role: "Nhóm trưởng",
    duties: ["Uỷ viên sinh hoạt"],
  },
  {
    name: "Nguyễn Anh Thư",
    key: "thu",
    role: "Nhóm trưởng",
    duties: ["Uỷ viên Cầu nguyện"],
  },
  {
    name: "Trần Thảo Anh",
    key: "thao",
    role: "Uỷ viên Âm nhạc",
    duties: ["Uỷ viên Truyền thông"],
  },
];
