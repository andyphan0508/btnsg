import {
  computeAge,
  computeMembershipYears,
  computeStage,
  MEMBER_STAGE_LABELS,
  type Member,
  type MemberStage,
} from '@btnsg/shared';

/* ============================================================
   Import danh sách thành viên từ Excel
   ============================================================ */

export type ParsedMemberRow = Partial<Member> & { name: string };

export type ExcelParseResult = {
  rows: ParsedMemberRow[];
  /** Cột trong file đã nhận diện được. */
  matchedColumns: string[];
  /** Dòng bị bỏ qua kèm lý do. */
  errors: string[];
};

/** Bỏ dấu tiếng Việt + thường hoá để so khớp tên cột linh hoạt. */
const normalizeHeader = (raw: string): string =>
  raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

type FieldKey =
  | 'name'
  | 'gender'
  | 'birthday'
  | 'phone'
  | 'phone2'
  | 'address'
  | 'occupation'
  | 'workplace'
  | 'email'
  | 'role'
  | 'boardRole'
  | 'duties'
  | 'group'
  | 'joinedAt'
  | 'status'
  | 'stage'
  | 'notes';

/** Bí danh tên cột (đã bỏ dấu) → field. */
const HEADER_ALIASES: Record<FieldKey, string[]> = {
  name: ['ho ten', 'ho va ten', 'ten', 'full name', 'name', 'ho ten thanh vien'],
  gender: ['gioi tinh', 'gender', 'nam nu'],
  birthday: ['ngay sinh', 'nam sinh', 'sinh nhat', 'birthday', 'dob', 'ngay thang nam sinh'],
  phone: ['sdt', 'so dien thoai', 'dien thoai', 'phone', 'so dt', 'di dong'],
  phone2: ['sdt 2', 'so dien thoai 2', 'dien thoai phu', 'sdt phu', 'phone 2'],
  address: ['dia chi', 'noi o', 'address', 'cho o'],
  occupation: ['nghe nghiep', 'nganh nghe', 'nganh hoc', 'cong viec', 'occupation', 'nghe'],
  workplace: ['noi lam viec', 'cong ty', 'truong', 'truong hoc', 'workplace', 'don vi'],
  email: ['email', 'thu dien tu', 'mail'],
  role: ['vai tro', 'role', 'phan loai'],
  boardRole: ['chuc vu', 'chuc danh', 'board role'],
  duties: ['nhiem vu', 'phan cong', 'duties', 'cong tac'],
  group: ['nhom', 'nhom nho', 'to', 'group', 'ten nhom'],
  joinedAt: ['ngay tham gia', 'tham gia', 'ngay gia nhap', 'gia nhap', 'joined', 'nam tham gia'],
  status: ['trang thai', 'status', 'tinh trang'],
  stage: ['giai doan', 'stage', 'ban nganh'],
  notes: ['ghi chu', 'note', 'notes'],
};

const matchHeader = (header: string): FieldKey | null => {
  const normalized = normalizeHeader(header);
  if (!normalized) return null;
  for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [FieldKey, string[]][]) {
    if (aliases.includes(normalized)) return field;
  }
  return null;
};

/** Chuyển giá trị ô ngày (chuỗi dd/mm/yyyy, yyyy-mm-dd, năm, hoặc serial Excel) → ISO yyyy-mm-dd. */
const toIsoDate = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'number') {
    // Số trong khoảng năm hợp lý coi như năm sinh; còn lại là serial date Excel
    // (số ngày tính từ 1899-12-30).
    if (value > 1900 && value < 2200) return `${Math.round(value)}-01-01`;
    const parsed = new Date(Date.UTC(1899, 11, 30) + Math.round(value) * 86_400_000);
    if (!Number.isNaN(parsed.getTime()) && parsed.getUTCFullYear() > 1900) {
      return parsed.toISOString().slice(0, 10);
    }
    return undefined;
  }

  const text = String(value).trim();
  if (/^\d{4}$/.test(text)) return `${text}-01-01`;
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);

  const dmy = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return undefined;
};

const toGender = (value: unknown): Member['gender'] => {
  const text = normalizeHeader(String(value ?? ''));
  if (text.startsWith('nam') || text === 'male' || text === 'm') return 'nam';
  if (text.startsWith('nu') || text === 'female' || text === 'f') return 'nu';
  return undefined;
};

const toRole = (value: unknown): Member['role'] | undefined => {
  const text = normalizeHeader(String(value ?? ''));
  if (!text) return undefined;
  if (text.includes('bdh') || text.includes('dieu hanh') || text.includes('leader') || text.includes('truong')) {
    return 'leader';
  }
  return 'member';
};

const toStatus = (value: unknown): Member['status'] | undefined => {
  const text = normalizeHeader(String(value ?? ''));
  if (!text) return undefined;
  if (text.includes('vang') || text.includes('nghi') || text.includes('inactive') || text.includes('tam')) {
    return 'inactive';
  }
  return 'active';
};

const toStage = (value: unknown): MemberStage | undefined => {
  const text = normalizeHeader(String(value ?? ''));
  if (!text) return undefined;
  if (text.includes('thieu nien')) return 'thieu_nien';
  if (text.includes('thanh trang') || text.includes('trung trang')) return 'thanh_trang';
  if (text.includes('thanh nien')) return 'thanh_nien';
  return undefined;
};

const toDuties = (value: unknown): string[] => {
  return String(value ?? '')
    .split(/[,;\n]/)
    .map((duty) => duty.trim())
    .filter((duty) => duty !== '');
};

/** Tải thư viện xlsx theo nhu cầu để không phình bundle chính. */
const loadXlsx = () => import('xlsx');

export const parseMembersExcel = async (file: File): Promise<ExcelParseResult> => {
  const XLSX = await loadXlsx();
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return { rows: [], matchedColumns: [], errors: ['File không có sheet dữ liệu nào.'] };

  const table = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  if (table.length === 0) return { rows: [], matchedColumns: [], errors: ['Sheet đầu tiên không có dòng dữ liệu.'] };

  // Map tên cột thực tế → field
  const columnMap = new Map<string, FieldKey>();
  for (const header of Object.keys(table[0])) {
    const field = matchHeader(header);
    if (field && ![...columnMap.values()].includes(field)) columnMap.set(header, field);
  }

  if (![...columnMap.values()].includes('name')) {
    return {
      rows: [],
      matchedColumns: [...columnMap.keys()],
      errors: ['Không tìm thấy cột họ tên. Cần có cột "Họ tên" (hoặc "Tên").'],
    };
  }

  const rows: ParsedMemberRow[] = [];
  const errors: string[] = [];

  table.forEach((rawRow, index) => {
    const draft: Partial<Member> = { duties: [] };
    for (const [header, field] of columnMap) {
      const value = rawRow[header];
      switch (field) {
        case 'name': {
          const name = String(value ?? '').trim();
          if (name) draft.name = name;
          break;
        }
        case 'gender': draft.gender = toGender(value); break;
        case 'birthday': draft.birthday = toIsoDate(value); break;
        case 'phone': {
          const phone = String(value ?? '').trim();
          if (phone) draft.phone = phone;
          break;
        }
        case 'phone2': {
          const phone2 = String(value ?? '').trim();
          if (phone2) draft.phone2 = phone2;
          break;
        }
        case 'address': {
          const address = String(value ?? '').trim();
          if (address) draft.address = address;
          break;
        }
        case 'occupation': {
          const occupation = String(value ?? '').trim();
          if (occupation) draft.occupation = occupation;
          break;
        }
        case 'workplace': {
          const workplace = String(value ?? '').trim();
          if (workplace) draft.workplace = workplace;
          break;
        }
        case 'email': {
          const email = String(value ?? '').trim();
          if (email) draft.email = email;
          break;
        }
        case 'role': draft.role = toRole(value); break;
        case 'boardRole': {
          const boardRole = String(value ?? '').trim();
          if (boardRole) draft.boardRole = boardRole;
          break;
        }
        case 'duties': draft.duties = toDuties(value); break;
        case 'group': {
          const group = String(value ?? '').trim();
          if (group) draft.group = group;
          break;
        }
        case 'joinedAt': draft.joinedAt = toIsoDate(value); break;
        case 'status': draft.status = toStatus(value); break;
        case 'stage': draft.stage = toStage(value); break;
        case 'notes': {
          const notes = String(value ?? '').trim();
          if (notes) draft.notes = notes;
          break;
        }
      }
    }

    if (!draft.name) {
      errors.push(`Dòng ${index + 2}: thiếu họ tên — đã bỏ qua.`);
      return;
    }
    rows.push({
      ...draft,
      name: draft.name,
      role: draft.role ?? 'member',
      status: draft.status ?? 'active',
      duties: draft.duties ?? [],
    });
  });

  return { rows, matchedColumns: [...columnMap.keys()], errors };
};

/* ============================================================
   Export danh sách thành viên ra Excel
   ============================================================ */

const STATUS_LABELS: Record<Member['status'], string> = {
  active: 'Đang sinh hoạt',
  inactive: 'Tạm vắng',
};

export const exportMembersExcel = async (
  members: Member[],
  filename = 'danh-sach-thanh-vien.xlsx',
): Promise<void> => {
  const XLSX = await loadXlsx();
  const now = new Date();
  const data = members.map((member, index) => {
    const stage = computeStage(member, now);
    return {
      'STT': index + 1,
      'Họ tên': member.name,
      'Giới tính': member.gender === 'nam' ? 'Nam' : member.gender === 'nu' ? 'Nữ' : '',
      'Ngày sinh': member.birthday ?? '',
      'Tuổi': computeAge(member.birthday, now) ?? '',
      'Giai đoạn': stage ? MEMBER_STAGE_LABELS[stage] : '',
      'Vai trò': member.role === 'leader' ? 'Ban Điều Hành' : 'Ban viên',
      'Chức vụ': member.boardRole ?? '',
      'Nhiệm vụ': member.duties.join(', '),
      'Nhóm nhỏ': member.group ?? '',
      'SĐT': member.phone ?? '',
      'SĐT phụ': member.phone2 ?? '',
      'Email': member.email ?? '',
      'Địa chỉ': member.address ?? '',
      'Ngành nghề': member.occupation ?? '',
      'Nơi làm việc / trường': member.workplace ?? '',
      'Ngày tham gia': member.joinedAt ?? '',
      'Năm tham gia': computeMembershipYears(member.joinedAt, now) ?? '',
      'Trạng thái': STATUS_LABELS[member.status],
      'Ghi chú': member.notes ?? '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 5 }, { wch: 24 }, { wch: 9 }, { wch: 12 }, { wch: 6 }, { wch: 11 },
    { wch: 14 }, { wch: 18 }, { wch: 30 }, { wch: 12 }, { wch: 13 }, { wch: 13 },
    { wch: 26 }, { wch: 34 }, { wch: 22 }, { wch: 24 },
    { wch: 13 }, { wch: 12 }, { wch: 14 }, { wch: 30 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Thành viên');
  XLSX.writeFile(workbook, filename);
};
