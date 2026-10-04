/**
 * Nội dung trang landing chỉnh được từ dashboard (màn hình "Website").
 *
 * Mỗi mục (section) = một dòng trong bảng site_content (key → value jsonb). Mục nào chưa lưu
 * thì landing dùng giá trị mặc định khai báo ngay trong mục đó. Dashboard dựng form từ chính
 * danh sách này, nên thêm một ô chỉnh = thêm một dòng `field(...)` + đọc nó ở component landing.
 *
 * Ô kiểu "rich": *chữ* → nhấn màu nắng / in nghiêng; {anh} → viên ảnh nhóm; {logo} → logo tròn.
 */

export type SiteFieldType = 'text' | 'textarea' | 'rich' | 'url' | 'image' | 'lines' | 'checkbox' | 'select';

export type SiteOption = { value: string; label: string };

export type SiteField = {
  name: string;
  label: string;
  type: SiteFieldType;
  options?: SiteOption[];
  hint?: string;
};

export type SiteRecord = Record<string, unknown>;

export type SiteSection = {
  key: string;
  label: string;
  hint?: string;
  fields: SiteField[];
  /** Có → giá trị là danh sách các mục cùng cấu trúc `fields`. */
  list?: { itemLabel: string; titleField: string };
  defaults: SiteRecord | SiteRecord[];
};

export type SitePage = {
  id: string;
  label: string;
  /** Đường dẫn trên landing — khung xem trước mở đúng trang này. */
  path: string;
  sections: SiteSection[];
};

export type SiteContent = Record<string, SiteRecord | SiteRecord[]>;

const field = (name: string, label: string, type: SiteFieldType = 'text', extra: Partial<SiteField> = {}): SiteField => ({
  name,
  label,
  type,
  ...extra,
});

/** Icon dùng chung cho mọi danh sách (landing ánh xạ key → icon trong src/lib/icons.js). */
export const SITE_ICON_OPTIONS: SiteOption[] = [
  { value: 'church', label: 'Nhà thờ' },
  { value: 'book', label: 'Kinh Thánh' },
  { value: 'books', label: 'Sách' },
  { value: 'pray', label: 'Cầu nguyện' },
  { value: 'music', label: 'Âm nhạc' },
  { value: 'visit', label: 'Bắt tay / thăm viếng' },
  { value: 'flame', label: 'Ngọn lửa' },
  { value: 'megaphone', label: 'Loa / truyền giảng' },
  { value: 'heart', label: 'Bàn tay trái tim' },
  { value: 'compass', label: 'La bàn' },
  { value: 'training', label: 'Mũ tốt nghiệp' },
  { value: 'friends', label: 'Nhóm người' },
  { value: 'home', label: 'Toà nhà' },
  { value: 'calendar', label: 'Lịch' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'web', label: 'Website' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Điện thoại' },
];

export const SITE_TONE_OPTIONS: SiteOption[] = [
  { value: 'sun', label: 'Cam nắng' },
  { value: 'indigo', label: 'Chàm' },
  { value: 'rose', label: 'Hồng' },
  { value: 'violet', label: 'Tím' },
  { value: 'amber', label: 'Vàng hổ phách' },
];

const RICH_HINT = '*chữ* → nhấn màu · {anh} → viên ảnh nhóm · {logo} → logo';
const icon = () => field('icon', 'Icon', 'select', { options: SITE_ICON_OPTIONS });
const pageHero = (title: string, lead: string) => ({ pageTitle: title, pageLead: lead });
const pageHeroFields = () => [field('pageTitle', 'Tiêu đề đầu trang'), field('pageLead', 'Mô tả đầu trang', 'textarea')];

export const SITE_PAGES: SitePage[] = [
  {
    id: 'general',
    label: 'Thông tin chung',
    path: '/lien-he',
    sections: [
      {
        key: 'general',
        label: 'Thương hiệu & SEO',
        fields: [
          field('brand', 'Tên Ban'),
          field('brandCity', 'Thành phố (chữ nghiêng cạnh tên)'),
          field('orgLine', 'Dòng tên Hội Thánh (menu mobile)'),
          field('mission', 'Khẩu hiệu sứ mệnh'),
          field('meeting', 'Giờ nhóm chính', 'text', { hint: 'Hiện ở trang chủ, chân trang, lời mời cuối trang' }),
          field('email', 'Email nhận lời nhắn'),
          field('facebook', 'Link Fanpage Facebook', 'url'),
          field('footerAbout', 'Giới thiệu ở chân trang', 'textarea'),
          field('seoTitle', 'Tiêu đề tab trình duyệt (SEO)'),
          field('seoDescription', 'Mô tả khi tìm kiếm Google (SEO)', 'textarea'),
        ],
        defaults: {
          brand: 'Ban Thanh Niên',
          brandCity: 'Sài Gòn',
          orgLine: 'HTTL Việt Nam · Chi Hội Sài Gòn',
          mission: 'TẤT CẢ VÌ NGƯỜI CHƯA ĐƯỢC CỨU',
          meeting: 'Chúa Nhật · 14:30',
          email: 'banthanhniensaigon@gmail.com',
          facebook: 'https://www.facebook.com/banthanhnienhttlsaigon',
          footerAbout:
            'Ban Thanh Niên — Hội Thánh Tin Lành Việt Nam, Chi Hội Sài Gòn. Đồng hành cùng người trẻ thành phố từ năm 1942.',
          seoTitle: 'Ban Thanh Niên — HTTL Sài Gòn',
          seoDescription:
            'Ban Thanh Niên — Hội Thánh Tin Lành Việt Nam, Chi Hội Sài Gòn. Nơi người trẻ gặp gỡ Chúa, gắn kết cộng đồng và sống cho điều cao đẹp.',
        },
      },
      {
        key: 'church',
        label: 'Địa điểm & bản đồ',
        fields: [
          field('name', 'Tên nhà thờ'),
          field('address', 'Địa chỉ nhà thờ'),
          field('room', 'Phòng sinh hoạt của Ban'),
          field('mapQuery', 'Địa chỉ tìm trên Google Maps', 'text', { hint: 'Dùng cho bản đồ nhúng và nút "Chỉ đường"' }),
        ],
        defaults: {
          name: 'Nhà thờ Tin Lành Sài Gòn',
          address: '155 Trần Hưng Đạo, Phường Cầu Ông Lãnh, TP. Hồ Chí Minh',
          room: 'Lầu 2, số 161 Đề Thám, Phường Cầu Ông Lãnh, TP. Hồ Chí Minh',
          mapQuery: 'Hội Thánh Tin Lành Việt Nam Chi Hội Sài Gòn, 155 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh',
        },
      },
      {
        key: 'links',
        label: 'Kênh mạng xã hội',
        list: { itemLabel: 'kênh', titleField: 'short' },
        fields: [
          field('short', 'Tên ngắn (chân trang)'),
          field('label', 'Tên đầy đủ (trang Liên hệ)'),
          field('href', 'Đường dẫn', 'url'),
          icon(),
        ],
        defaults: [
          {
            href: 'https://www.facebook.com/banthanhnienhttlsaigon',
            label: 'Facebook — Ban Thanh Niên HTTL Sài Gòn',
            short: 'Facebook',
            icon: 'facebook',
          },
          { href: 'https://httlsaigon.org', label: 'Website Hội Thánh — httlsaigon.org', short: 'httlsaigon.org', icon: 'web' },
          {
            href: 'https://www.youtube.com/@BanThanhnienSaiGon',
            label: 'YouTube Ban Thanh Niên',
            short: 'YouTube',
            icon: 'youtube',
          },
        ],
      },
    ],
  },
  {
    id: 'home',
    label: 'Trang chủ',
    path: '/',
    sections: [
      {
        key: 'hero',
        label: 'Phần mở đầu (Hero)',
        fields: [
          field('org', 'Dòng nhỏ phía trên tiêu đề'),
          field('line1', 'Tiêu đề — dòng 1', 'rich', { hint: RICH_HINT }),
          field('line2', 'Tiêu đề — dòng 2', 'rich', { hint: RICH_HINT }),
          field('lead', 'Đoạn mô tả', 'textarea'),
          field('ctaPrimary', 'Nút chính (→ Sinh hoạt)'),
          field('ctaSecondary', 'Nút phụ (→ Giới thiệu)'),
          field('image', 'Ảnh nhóm', 'image', {
            hint: 'Dán link ảnh Google Drive hoặc https://… — để trống dùng ảnh mặc định. Ảnh này cũng dùng cho {anh}.',
          }),
          field('imageAlt', 'Mô tả ảnh (cho người khiếm thị & SEO)'),
        ],
        defaults: {
          org: 'Ban Thanh Niên · Hội Thánh Tin Lành Sài Gòn',
          line1: 'Gặp Chúa, gặp nhau {anh}',
          line2: 'và cùng *tỏa sáng.*',
          lead: 'Nơi người trẻ Sài Gòn cùng thờ phượng, học Lời Chúa và sống cho điều cao đẹp. Hẹn bạn mỗi chiều Chúa Nhật lúc 14:30.',
          ctaPrimary: 'Tham gia Chúa Nhật này',
          ctaSecondary: 'Câu chuyện của chúng tôi',
          image: '',
          imageAlt: 'Các bạn trẻ Ban Thanh Niên vẫy tay chào trong buổi nhóm Giáng Sinh',
        },
      },
      {
        key: 'marquee',
        label: 'Băng chữ chạy',
        fields: [
          field('row1', 'Hàng kính (mỗi dòng một cụm)', 'lines'),
          field('row2', 'Hàng màu nắng (mỗi dòng một cụm)', 'lines'),
        ],
        defaults: {
          row1: ['Thờ phượng', 'Lời Chúa', 'Tình thân', 'Âm nhạc', 'Truyền giảng', 'Phục vụ'],
          row2: ['Tất cả vì người chưa được cứu', 'Chúa Nhật · 14:30', 'Từ 1942', '161 Đề Thám, Q.1', 'Môn Đồ Chúa Cứu Thế'],
        },
      },
      {
        key: 'home',
        label: 'Các khối nội dung',
        fields: [
          field('manifesto', 'Tuyên ngôn (sáng dần khi cuộn)', 'rich', { hint: RICH_HINT }),
          field('manifestoLink', 'Chữ liên kết dưới tuyên ngôn'),
          field('bentoTitle', 'Lưới ô — tiêu đề', 'rich', { hint: RICH_HINT }),
          field('bentoLead', 'Lưới ô — mô tả', 'textarea'),
          field('bentoScheduleNote', 'Ô Lịch sinh hoạt — ghi chú'),
          field('bentoNews', 'Ô Tin tức — mô tả'),
          field('bentoGalleryTitle', 'Ô Thư viện ảnh — tiêu đề'),
          field('bentoGalleryNote', 'Ô Thư viện ảnh — ghi chú'),
          field('ministriesTitle', 'Mục vụ — tiêu đề', 'rich', { hint: RICH_HINT }),
          field('ministriesLead', 'Mục vụ — mô tả', 'textarea'),
          field('scheduleTitle', 'Lịch tuần — tiêu đề', 'rich', { hint: RICH_HINT }),
          field('scheduleLead', 'Lịch tuần — mô tả', 'textarea'),
          field('ringTitle', 'Vòng ảnh 3D — tiêu đề', 'rich', { hint: RICH_HINT }),
          field('ringCaption', 'Vòng ảnh 3D — chú thích'),
          field('ctaTitle', 'Lời mời cuối trang', 'rich', { hint: RICH_HINT }),
        ],
        defaults: {
          manifesto:
            'Ban Thanh Niên {logo} là mái nhà của những người trẻ cùng *thờ phượng Chúa,* học Lời Ngài, nâng đỡ nhau qua từng mùa của cuộc sống và phục vụ bằng âm nhạc, truyền giảng, thiện nguyện — với một sứ mệnh: *tất cả vì người chưa được cứu.*',
          manifestoLink: 'Đọc câu chuyện hơn 80 năm',
          bentoTitle: 'Một nơi để bạn *thuộc về*',
          bentoLead:
            'Từ câu Kinh Thánh định hướng cả năm đến những buổi nhóm mỗi tuần — đây là nhịp sống của Ban Thanh Niên.',
          bentoScheduleNote: 'Nhóm thờ phượng tại Lầu 2, số 161 Đề Thám, Quận 1.',
          bentoNews: 'Thông báo & bài viết mới',
          bentoGalleryTitle: 'Hành trình thắp sáng niềm tin',
          bentoGalleryNote: 'Những khoảnh khắc thờ phượng, nhóm lại và phục vụ.',
          ministriesTitle: 'Được gây dựng để *đi ra*',
          ministriesLead:
            'Sáu mảng mục vụ giúp người trẻ trưởng thành trong đức tin, gắn kết tình thân và mang Tin Lành đến cho thành phố.',
          scheduleTitle: 'Nhịp sinh hoạt *mỗi tuần*',
          scheduleLead: 'Lần đầu đến? Hãy bắt đầu với buổi thờ phượng chiều Chúa Nhật — luôn có người chào đón bạn.',
          ringTitle: 'Những ngày *ta có nhau*',
          ringCaption: 'Mỗi bức ảnh là một câu chuyện về sự thờ phượng, tình thân và phục vụ.',
          ctaTitle: 'Hẹn gặp bạn {anh} Chúa Nhật này.',
        },
      },
    ],
  },
  {
    id: 'about',
    label: 'Giới thiệu',
    path: '/gioi-thieu',
    sections: [
      {
        key: 'about',
        label: 'Nội dung trang',
        fields: [
          ...pageHeroFields(),
          field('storyTitle', 'Câu chuyện — tiêu đề', 'rich', { hint: RICH_HINT }),
          field('storyLead', 'Câu chuyện — mở đầu', 'textarea'),
          field('story', 'Câu chuyện — đoạn sáng dần khi cuộn', 'rich', { hint: RICH_HINT }),
          field('timelineTitle', 'Dòng thời gian — tiêu đề', 'rich', { hint: RICH_HINT }),
          field('boardTitle', 'Ban Điều Hành — tiêu đề', 'rich', { hint: RICH_HINT }),
          field('boardLead', 'Ban Điều Hành — mô tả', 'textarea'),
          field('photoTitle', 'Tiêu đề dải ảnh cuối trang'),
        ],
        defaults: {
          ...pageHero(
            'Giới thiệu Ban Thanh Niên',
            'Hành trình từ Ca đoàn 3 đến Ban Thanh Niên hôm nay — hơn 80 năm cùng người trẻ Sài Gòn.',
          ),
          storyTitle: 'Mái nhà cho nhiều thế hệ *bạn trẻ*',
          storyLead:
            'Ban Thanh Niên là một ban ngành của Hội Thánh Tin Lành Việt Nam – Chi Hội Sài Gòn, Hội Thánh được thành lập năm 1920 — một trong những Hội Thánh Tin Lành đầu tiên tại Sài Gòn.',
          story:
            'Ban được hình thành từ những năm đầu khi Hội Thánh mới thành lập, và chính thức trở thành một ban ngành trong tổ chức của Hội Thánh vào khoảng *năm 1942–1944,* sau Đại Hội Đồng Tổng Liên Hội năm 1942. Ban quy tụ các bạn trẻ cùng nhau thờ phượng Chúa, học Lời Chúa, gây dựng đời sống thuộc linh, phục vụ qua âm nhạc và chung tay trong công tác *truyền giảng, thiện nguyện xã hội.*',
          timelineTitle: 'Tên gọi qua *các thời kỳ*',
          boardTitle: 'Ban Điều Hành *đương nhiệm*',
          boardLead:
            'Những người trẻ tận tụy gánh vác các tiểu ban và công việc nhà Chúa, cùng gây dựng một cộng đồng vững mạnh.',
          photoTitle: 'Chúng tôi trong những buổi nhóm',
        },
      },
      {
        key: 'stats',
        label: 'Con số nổi bật',
        list: { itemLabel: 'con số', titleField: 'label' },
        fields: [field('num', 'Con số (chỉ chữ số)'), field('label', 'Ý nghĩa')],
        defaults: [
          { num: '200', label: 'ban viên có tên trong danh sách' },
          { num: '60', label: 'ban viên sinh hoạt thường xuyên' },
          { num: '11', label: 'thành viên Ban Điều Hành (từ 2004)' },
        ],
      },
      {
        key: 'nameTimeline',
        label: 'Tên gọi qua các thời kỳ',
        list: { itemLabel: 'thời kỳ', titleField: 'name' },
        fields: [
          field('era', 'Giai đoạn'),
          field('name', 'Tên gọi'),
          field('note', 'Ghi chú', 'textarea'),
          field('current', 'Là tên hiện tại', 'checkbox'),
        ],
        defaults: [
          { era: '1975 – 1983', name: 'Ca đoàn 3', note: 'Khởi đầu từ tiếng hát — phục vụ Chúa qua âm nhạc.', current: false },
          {
            era: '1983 – 2002',
            name: 'Ban Hát Lễ 3',
            note: 'Tiếp nối di sản ca hát trong sự thờ phượng của Hội Thánh.',
            current: false,
          },
          {
            era: '2003 – nay',
            name: 'Ban Thanh Niên',
            note: 'Từ đầu thập niên 1990, Hội Đồng thường niên bầu chọn Ban Điều Hành; từ 2004 duy trì 11 thành viên.',
            current: true,
          },
        ],
      },
      {
        key: 'board',
        label: 'Ban Điều Hành',
        hint: 'Người đầu danh sách được hiển thị to nhất (Trưởng Ban).',
        list: { itemLabel: 'thành viên', titleField: 'name' },
        fields: [field('name', 'Họ tên'), field('role', 'Chức vụ'), field('duties', 'Nhiệm vụ (mỗi dòng một nhiệm vụ)', 'lines')],
        defaults: [
          { name: 'Hoàng Nguyễn Phương Uyên', role: 'Trưởng Ban', duties: ['Uỷ viên Linh vụ', 'Uỷ viên nhóm nhỏ'] },
          { name: 'Trần Nhật Kỳ', role: 'Phó Ban', duties: ['Uỷ viên Công tác Xã hội', 'Quản lý Nhà sinh viên'] },
          { name: 'Trương Thị Thanh Ngân', role: 'Thư ký', duties: ['Uỷ viên Đố Kinh Thánh'] },
          { name: 'Nguyễn Đặng Thiên Kim', role: 'Thủ quỹ', duties: ['Hậu cần'] },
          { name: 'Nguyễn Văn Tới', role: 'Uỷ viên Du lịch dã ngoại', duties: ['Uỷ viên Giữ xe'] },
          { name: 'Huỳnh Nguyên Bảo', role: 'Uỷ viên Kỹ thuật', duties: ['Uỷ viên Thăm viếng Chăm sóc'] },
          { name: 'Bùi Tuấn Anh', role: 'Nhóm trưởng', duties: ['Uỷ viên Truyền giảng'] },
          { name: 'Phan An Duy', role: 'Nhóm trưởng', duties: ['Quản lý Tài sản'] },
          { name: 'Dương Thảo Nhi', role: 'Nhóm trưởng', duties: ['Uỷ viên sinh hoạt'] },
          { name: 'Nguyễn Anh Thư', role: 'Nhóm trưởng', duties: ['Uỷ viên Cầu nguyện'] },
          { name: 'Trần Thảo Anh', role: 'Uỷ viên Âm nhạc', duties: ['Uỷ viên Truyền thông'] },
        ],
      },
    ],
  },
  {
    id: 'theme',
    label: 'Chủ đề năm',
    path: '/chu-de',
    sections: [
      {
        key: 'themeYear',
        label: 'Chủ đề năm',
        hint: 'Cũng hiện ở ô lớn trên trang chủ.',
        fields: [
          field('eyebrow', 'Nhãn (vd: Chủ đề năm 2026)'),
          field('title', 'Chủ đề'),
          field('verse', 'Câu gốc (đầy đủ)', 'textarea'),
          field('excerpt', 'Câu gốc rút gọn (ô trang chủ)', 'textarea'),
          field('ref', 'Trích dẫn (vd: II Ti-mô-thê 3:14-15)'),
          field('song', 'Bài hát khẩu hiệu'),
          field('note', 'Ghi chú cuối', 'textarea'),
          ...pageHeroFields(),
          field('photoTitle', 'Tiêu đề dải ảnh cuối trang'),
        ],
        defaults: {
          eyebrow: 'Chủ đề năm 2026',
          title: 'Môn Đồ Chúa Cứu Thế',
          verse:
            'Về phần con, hãy đứng vững trong những điều con đã học và tin quyết, vì biết mình đã học những điều đó với ai, và từ khi thơ ấu con đã biết Kinh Thánh vốn có thể khiến con khôn ngoan để được cứu bởi đức tin trong Đấng Christ Jêsus.',
          excerpt: 'Về phần con, hãy đứng vững trong những điều con đã học và tin quyết…',
          ref: 'II Ti-mô-thê 3:14-15',
          song: 'TC 271 — Ngài Dìu Dắt Tôi',
          note: 'Mỗi năm, Ban Thanh Niên chọn một chủ đề gắn với một câu Kinh Thánh gốc và một bài hát khẩu hiệu để định hướng sinh hoạt trong năm.',
          ...pageHero(
            'Chủ đề năm',
            'Mỗi năm, Ban Thanh Niên chọn một chủ đề gắn với câu Kinh Thánh gốc và một bài hát khẩu hiệu.',
          ),
          photoTitle: 'Sống chủ đề năm cùng nhau',
        },
      },
    ],
  },
  {
    id: 'activities',
    label: 'Sinh hoạt',
    path: '/sinh-hoat',
    sections: [
      {
        key: 'activities',
        label: 'Nội dung trang',
        fields: [...pageHeroFields(), field('committeesTitle', 'Tiêu đề khối tiểu ban'), field('photoTitle', 'Tiêu đề dải ảnh cuối trang')],
        defaults: {
          ...pageHero(
            'Lịch sinh hoạt',
            'Nhóm thờ phượng chiều Chúa Nhật 14:30 — bạn có thể đến bất cứ lúc nào, luôn có người chào đón.',
          ),
          committeesTitle: 'Các tiểu ban công tác',
          photoTitle: 'Không khí các buổi nhóm',
        },
      },
      {
        key: 'schedule',
        label: 'Lịch tuần',
        hint: 'Các ngày có trong lịch được thắp sáng ở ô "Lịch sinh hoạt" trang chủ (ghi đúng "Thứ Hai" … "Chúa Nhật").',
        list: { itemLabel: 'buổi', titleField: 'what' },
        fields: [
          field('day', 'Ngày'),
          field('time', 'Giờ'),
          field('what', 'Hoạt động'),
          field('note', 'Ghi chú'),
          field('main', 'Là buổi nhóm chính', 'checkbox'),
          icon(),
          field('tone', 'Màu thẻ', 'select', { options: SITE_TONE_OPTIONS }),
        ],
        defaults: [
          {
            day: 'Chúa Nhật',
            time: '14:30',
            what: 'Nhóm thờ phượng Chúa',
            note: 'Buổi nhóm chính trong tuần — dành cho mọi bạn trẻ.',
            main: true,
            icon: 'church',
            tone: 'sun',
          },
          { day: 'Thứ Ba', time: '19:00', what: 'Học Kinh Thánh', note: 'Cùng đào sâu Lời Chúa giữa tuần.', main: false, icon: 'book', tone: 'indigo' },
          { day: 'Thứ Năm', time: 'Buổi tối', what: 'Thăm viếng', note: 'Tuần thứ 2 và thứ 3 mỗi tháng.', main: false, icon: 'visit', tone: 'rose' },
          {
            day: 'Thứ Bảy',
            time: '18:30',
            what: 'Ban Điều Hành cầu nguyện',
            note: 'Cầu thay cho công việc của Ban.',
            main: false,
            icon: 'pray',
            tone: 'violet',
          },
          { day: 'Thứ Bảy', time: '19:30', what: 'Tập hát', note: 'Chuẩn bị tôn vinh Chúa cho Chúa Nhật.', main: false, icon: 'music', tone: 'amber' },
        ],
      },
      {
        key: 'subCommittees',
        label: 'Các tiểu ban',
        list: { itemLabel: 'tiểu ban', titleField: 'title' },
        fields: [field('title', 'Tên (vd: Tiểu ban: Thăm viếng)'), field('desc', 'Mô tả', 'textarea'), icon()],
        defaults: [
          {
            title: 'Tiểu ban: Nhóm trưởng',
            desc: 'Phụ trách các nhóm nhỏ trong Ban Thanh Niên — kèm cặp, cầu nguyện và chăm sóc thuộc linh cho từng ban viên theo nhóm.',
            icon: 'friends',
          },
          {
            title: 'Tiểu ban: Truyền giảng',
            desc: 'Tổ chức các chương trình truyền giảng, chia sẻ Tin Lành cho bạn trẻ chưa tin Chúa — trọng tâm sứ mệnh của Ban.',
            icon: 'megaphone',
          },
          {
            title: 'Tiểu ban: Thăm viếng',
            desc: 'Thăm hỏi, cầu nguyện và chăm sóc ban viên lúc đau ốm, khó khăn, hoặc mới đến sinh hoạt cùng Ban.',
            icon: 'visit',
          },
          {
            title: 'Tiểu ban: Âm nhạc – ca hát – ban đàn',
            desc: 'Tập hát và chuẩn bị chương trình tôn vinh Chúa mỗi Chúa Nhật; ban đàn đệm nhạc cho các buổi nhóm trong tuần.',
            icon: 'music',
          },
        ],
      },
    ],
  },
  {
    id: 'ministry',
    label: 'Mục vụ',
    path: '/muc-vu',
    sections: [
      {
        key: 'ministryPage',
        label: 'Nội dung trang',
        fields: [
          ...pageHeroFields(),
          field('dutiesTitle', 'Tiêu đề khối cơ sở & dịch vụ', 'rich', { hint: RICH_HINT }),
          field('partnersTitle', 'Tiêu đề khối ban ngành đồng hành'),
          field('partners', 'Các ban ngành đồng hành (mỗi dòng một ban)', 'lines'),
          field('photoTitle', 'Tiêu đề dải ảnh cuối trang'),
        ],
        defaults: {
          ...pageHero(
            'Chúng tôi phục vụ',
            'Bồi linh, truyền giảng, công tác xã hội, dã ngoại, huấn luyện — được gây dựng để đi ra.',
          ),
          dutiesTitle: 'Quản lý cơ sở & *dịch vụ*',
          partnersTitle: 'Đồng hành cùng các ban ngành Hội Thánh',
          partners: ['Ban Phiên dịch', 'Ban Trình chiếu', 'Trường Chúa Nhật', 'Ban Đàn', 'Ban Trang trí', 'Ban Âm thanh', 'Ban Thiếu Nhi', 'Ban Ấu Nhi'],
          photoTitle: 'Dấu chân phục vụ',
        },
      },
      {
        key: 'ministries',
        label: 'Các mảng mục vụ',
        hint: 'Cũng hiện ở trang chủ (khối accordion ảnh).',
        list: { itemLabel: 'mục vụ', titleField: 'title' },
        fields: [field('kind', 'Nhóm (vd: Thuộc linh)'), field('title', 'Tên'), field('desc', 'Mô tả', 'textarea'), icon()],
        defaults: [
          {
            kind: 'Thuộc linh',
            title: 'Bồi linh',
            desc: 'Chương trình bồi linh hằng năm gây dựng đời sống thuộc linh cho ban viên.',
            icon: 'flame',
          },
          {
            kind: 'Sứ mệnh',
            title: 'Truyền giảng',
            desc: 'Những chương trình truyền giảng chia sẻ Tin Lành cho người chưa tin — trọng tâm sứ mệnh của Hội Thánh.',
            icon: 'megaphone',
          },
          {
            kind: 'Cộng đồng',
            title: 'Công tác xã hội',
            desc: 'Chương trình gây dựng, xây dựng và giúp đỡ cộng đồng, kết nối với các Hội Thánh gặp khó khăn.',
            icon: 'heart',
          },
          {
            kind: 'Gắn kết',
            title: 'Du lịch – dã ngoại',
            desc: 'Những chuyến đi hằng năm để gắn kết tình thân giữa các ban viên, kết nối tình anh em trong Chúa.',
            icon: 'compass',
          },
          {
            kind: 'Đào tạo',
            title: 'Huấn luyện',
            desc: 'Đào tạo cho các tiểu ban: nhóm trưởng, truyền giảng, thăm viếng, âm nhạc, đào tạo các lớp kế thừa cho thế hệ tiếp theo.',
            icon: 'training',
          },
          {
            kind: 'Giao lưu',
            title: 'Họp bạn Thanh Niên',
            desc: 'Giao lưu, họp bạn với Ban Thanh Niên của các Hội Thánh bạn.',
            icon: 'friends',
          },
        ],
      },
      {
        key: 'duties',
        label: 'Cơ sở & dịch vụ quản lý',
        list: { itemLabel: 'mục', titleField: 'title' },
        fields: [field('title', 'Tên'), field('desc', 'Mô tả', 'textarea'), icon()],
        defaults: [
          {
            title: 'Nhà trọ sinh viên',
            desc: 'Quản lý hai nhà trọ sinh viên — chỗ ở và môi trường thuộc linh cho sinh viên xa nhà.',
            icon: 'home',
          },
          { title: 'Quầy sách Cơ Đốc', desc: 'Phục vụ Hội Thánh qua việc quản lý quầy sách Cơ Đốc.', icon: 'books' },
        ],
      },
    ],
  },
  {
    id: 'contact',
    label: 'Liên hệ',
    path: '/lien-he',
    sections: [
      {
        key: 'contactPage',
        label: 'Nội dung trang',
        fields: [
          ...pageHeroFields(),
          field('title', 'Tiêu đề khối liên hệ', 'rich', { hint: RICH_HINT }),
          field('lead', 'Mô tả khối liên hệ', 'textarea'),
          field('followTitle', 'Tiêu đề thẻ mạng xã hội'),
        ],
        defaults: {
          ...pageHero('Liên hệ với chúng tôi', 'Địa chỉ nhà thờ, bản đồ chỉ đường và các kênh liên lạc của Ban Thanh Niên.'),
          title: 'Ghé thăm & *kết nối*',
          lead: 'Muốn nhắn tin cho chúng tôi? Bấm nút tin nhắn ở góc phải màn hình để gửi lời nhắn hoặc đăng ký tham gia.',
          followTitle: 'Theo dõi chúng tôi',
        },
      },
      {
        key: 'contacts',
        label: 'Địa chỉ liên hệ',
        list: { itemLabel: 'địa chỉ', titleField: 'title' },
        fields: [field('title', 'Tên địa điểm'), field('desc', 'Địa chỉ', 'textarea')],
        defaults: [
          { title: 'Hội Thánh Tin Lành Chi Hội Sài Gòn', desc: '155 Trần Hưng Đạo, Phường Cầu Ông Lãnh, TP. Hồ Chí Minh' },
          { title: 'Phòng sinh hoạt Ban Thanh Niên', desc: 'Lầu 2, số 161 Đề Thám, Phường Cầu Ông Lãnh, TP. Hồ Chí Minh' },
        ],
      },
    ],
  },
  {
    id: 'media',
    label: 'Tin tức & Thư viện',
    path: '/tin-tuc',
    sections: [
      {
        key: 'newsPage',
        label: 'Trang Tin tức',
        hint: 'Bài viết đăng ở mục "Đăng bài Tin tức".',
        fields: pageHeroFields(),
        defaults: pageHero('Tin tức & bài viết', 'Tin tức, thông báo và bài viết về các hoạt động của Ban Thanh Niên HTTL Sài Gòn.'),
      },
      {
        key: 'galleryPage',
        label: 'Trang Thư viện ảnh',
        hint: 'Ảnh lấy từ folder Google Drive của thư viện.',
        fields: pageHeroFields(),
        defaults: pageHero(
          'Hành trình thắp sáng niềm tin',
          'Những hình ảnh chân thật trong sự thờ phượng, nhóm lại và phục vụ của Ban Thanh Niên HTTL Sài Gòn.',
        ),
      },
    ],
  },
];

export const SITE_SECTIONS: SiteSection[] = SITE_PAGES.flatMap((page) => page.sections);

/* ---------- Chuẩn hoá dữ liệu đã lưu (dữ liệu sai kiểu không được làm vỡ trang) ---------- */

const isRecord = (value: unknown): value is SiteRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Chỉ cho phép liên kết http(s)/mailto/tel — chặn javascript: lọt vào href của landing. */
const SAFE_URL = /^(https?:\/\/|mailto:|tel:)/i;

const normalizeValue = (spec: SiteField, value: unknown, fallback: unknown): unknown => {
  if (value == null) return fallback;
  switch (spec.type) {
    case 'checkbox':
      return Boolean(value);
    case 'lines':
      return (Array.isArray(value) ? value : String(value).split('\n'))
        .map((line) => String(line).trim())
        .filter(Boolean);
    case 'url': {
      const url = String(value ?? '').trim();
      return url === '' || SAFE_URL.test(url) ? url : '';
    }
    default:
      return value == null ? '' : String(value);
  }
};

const normalizeRecord = (section: SiteSection, value: unknown, base: SiteRecord): SiteRecord => {
  const source = isRecord(value) ? value : {};
  const record: SiteRecord = {};
  for (const spec of section.fields) record[spec.name] = normalizeValue(spec, source[spec.name], base[spec.name]);
  return record;
};

/** Mục trống của một danh sách — dashboard dùng khi bấm "Thêm". */
export const blankSiteItem = (section: SiteSection): SiteRecord =>
  Object.fromEntries(
    section.fields.map((spec) => [
      spec.name,
      spec.type === 'lines' ? [] : spec.type === 'checkbox' ? false : spec.options ? spec.options[0].value : '',
    ]),
  );

/** Ghép nội dung đã lưu lên giá trị mặc định; mục chưa lưu / sai kiểu → mặc định. */
export const mergeSiteContent = (saved: unknown): SiteContent => {
  const source = isRecord(saved) ? saved : {};
  const content: SiteContent = {};
  for (const section of SITE_SECTIONS) {
    const value = source[section.key];
    if (section.list) {
      // Mặc định cũng đi qua chuẩn hoá → ghép nhiều lần cho cùng kết quả (dashboard so sánh để biết mục nào đã sửa).
      content[section.key] = (Array.isArray(value) ? value : (section.defaults as SiteRecord[])).map((item) =>
        normalizeRecord(section, item, blankSiteItem(section)),
      );
    } else {
      content[section.key] = normalizeRecord(section, value, section.defaults as SiteRecord);
    }
  }
  return content;
};

/**
 * Link ảnh người dùng dán → URL hiển thị được. Hỗ trợ link chia sẻ Google Drive
 * (…/file/d/<id>/…, ?id=<id>) hoặc ID trần; còn lại chỉ nhận https://. Không hợp lệ → ''.
 */
export const toSiteImageUrl = (input: unknown, width = 1600): string => {
  const value = String(input ?? '').trim();
  const driveId =
    value.match(/drive\.google\.com\/(?:file\/d\/|.*[?&]id=)([\w-]{20,})/)?.[1] ??
    (/^[\w-]{25,}$/.test(value) ? value : null);
  // Máy chủ ảnh lh3 trực tiếp (không qua redirect của drive.google.com/thumbnail), -rw = WebP.
  if (driveId) return `https://lh3.googleusercontent.com/d/${driveId}=w${width}-rw`;
  return /^https:\/\//i.test(value) ? value : '';
};
