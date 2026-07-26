import type { Expense } from '@btnsg/shared';
import {
  PAYMENT_METHOD_LABELS,
  groupByPeriod,
  summarizeByCategory,
  summarizeExpenses,
} from '@btnsg/shared';

/** Tải thư viện xlsx theo nhu cầu để không phình bundle chính. */
const loadXlsx = () => import('xlsx');

const TYPE_LABELS: Record<Expense['type'], string> = {
  income: 'Thu',
  expense: 'Chi',
};

/**
 * Xuất sổ quỹ của thủ quỹ ra Excel, gồm 3 sheet:
 *  1. "Sổ quỹ"        — từng giao dịch, đầy đủ cột, kèm cột số dư luỹ kế theo thời gian.
 *  2. "Tổng hợp tháng" — thu / chi / chênh lệch từng tháng và số dư luỹ kế cuối tháng.
 *  3. "Theo hạng mục"  — cơ cấu thu và chi theo hạng mục, kèm tỷ trọng.
 */
export const exportFinanceWorkbook = async (
  expenses: Expense[],
  filename = 'so-quy-btnsg.xlsx',
): Promise<void> => {
  const XLSX = await loadXlsx();

  // Sổ quỹ đọc theo thứ tự thời gian tăng dần thì số dư luỹ kế mới có nghĩa.
  const ordered = [...expenses].sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt),
  );

  /* ---------- Sheet 1: Sổ quỹ ---------- */
  let running = 0;
  const ledgerRows = ordered.map((expense, index) => {
    const income = expense.type === 'income' ? expense.amount : 0;
    const outcome = expense.type === 'expense' ? expense.amount : 0;
    running += income - outcome;
    return {
      STT: index + 1,
      'Ngày': expense.date,
      'Số phiếu': expense.receiptNo ?? '',
      'Loại': TYPE_LABELS[expense.type],
      'Hạng mục': expense.category,
      'Hạng mục con': expense.subCategory ?? '',
      'Nội dung / lý do': expense.note ?? '',
      'Thu': income || '',
      'Chi': outcome || '',
      'Số dư luỹ kế': running,
      'Hình thức': expense.paymentMethod ? PAYMENT_METHOD_LABELS[expense.paymentMethod] : '',
      'Người nộp / nhận': expense.counterparty ?? '',
      'Thủ quỹ': expense.handledBy ?? '',
      'Thuộc hoạt động': expense.eventName ?? '',
      'Link chứng từ': expense.attachmentUrl ?? '',
    };
  });

  const totals = summarizeExpenses(ordered);
  // Dòng tổng cuối sổ để đối chiếu nhanh.
  ledgerRows.push({
    STT: '' as unknown as number,
    'Ngày': '',
    'Số phiếu': '',
    'Loại': '',
    'Hạng mục': 'TỔNG CỘNG',
    'Hạng mục con': '',
    'Nội dung / lý do': '',
    'Thu': totals.income,
    'Chi': totals.expense,
    'Số dư luỹ kế': totals.balance,
    'Hình thức': '',
    'Người nộp / nhận': '',
    'Thủ quỹ': '',
    'Thuộc hoạt động': '',
    'Link chứng từ': '',
  });

  const ledgerSheet = XLSX.utils.json_to_sheet(ledgerRows);
  ledgerSheet['!cols'] = [
    { wch: 5 }, { wch: 12 }, { wch: 14 }, { wch: 6 }, { wch: 20 }, { wch: 20 },
    { wch: 32 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 13 }, { wch: 20 },
    { wch: 18 }, { wch: 20 }, { wch: 30 },
  ];

  /* ---------- Sheet 2: Tổng hợp tháng ---------- */
  let monthlyRunning = 0;
  const monthlyRows = groupByPeriod(ordered, 'month').map((bucket) => {
    monthlyRunning += bucket.balance;
    return {
      'Kỳ': bucket.label,
      'Số giao dịch': bucket.count,
      'Tổng thu': bucket.income,
      'Tổng chi': bucket.expense,
      'Chênh lệch': bucket.balance,
      'Số dư luỹ kế': monthlyRunning,
    };
  });
  const monthlySheet = XLSX.utils.json_to_sheet(monthlyRows);
  monthlySheet['!cols'] = [{ wch: 16 }, { wch: 13 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }];

  /* ---------- Sheet 3: Theo hạng mục ---------- */
  const categoryRows = [
    ...summarizeByCategory(ordered, 'income').map((row) => ({
      'Loại': 'Thu',
      'Hạng mục': row.category,
      'Số giao dịch': row.count,
      'Số tiền': row.amount,
      'Tỷ trọng (%)': Number(row.percent.toFixed(1)),
    })),
    ...summarizeByCategory(ordered, 'expense').map((row) => ({
      'Loại': 'Chi',
      'Hạng mục': row.category,
      'Số giao dịch': row.count,
      'Số tiền': row.amount,
      'Tỷ trọng (%)': Number(row.percent.toFixed(1)),
    })),
  ];
  const categorySheet = XLSX.utils.json_to_sheet(categoryRows);
  categorySheet['!cols'] = [{ wch: 6 }, { wch: 24 }, { wch: 13 }, { wch: 16 }, { wch: 13 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, ledgerSheet, 'Sổ quỹ');
  XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Tổng hợp tháng');
  XLSX.utils.book_append_sheet(workbook, categorySheet, 'Theo hạng mục');
  XLSX.writeFile(workbook, filename);
};
