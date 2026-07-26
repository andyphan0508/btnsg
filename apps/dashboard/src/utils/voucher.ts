import type { Expense } from '@btnsg/shared';
import { PAYMENT_METHOD_LABELS, amountToWords } from '@btnsg/shared';

/** Thông tin đơn vị in trên đầu phiếu — sửa ở đây là đổi cho mọi phiếu. */
const ORG = {
  church: 'HỘI THÁNH TIN LÀNH VIỆT NAM — CHI HỘI SÀI GÒN',
  unit: 'BAN THANH NIÊN',
  address: '155 Trần Hưng Đạo, Phường Cô Giang, Quận 1, TP. Hồ Chí Minh',
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const formatMoneyPlain = (amount: number): string => new Intl.NumberFormat('vi-VN').format(amount);

const splitDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { day: '…', month: '…', year: '…' };
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    year: String(date.getFullYear()),
  };
};

const row = (label: string, value: string): string => `
  <tr>
    <td class="lbl">${escapeHtml(label)}</td>
    <td class="val">${value ? escapeHtml(value) : '<span class="dots"></span>'}</td>
  </tr>`;

const VOUCHER_STYLES = `
  @page { size: A5 landscape; margin: 12mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 13pt;
    color: #000;
    margin: 0;
    padding: 8mm;
  }
  .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
  .org { font-size: 10.5pt; line-height: 1.45; }
  .org .church { font-weight: bold; }
  .org .unit { font-weight: bold; text-decoration: underline; }
  .org .addr { font-style: italic; font-size: 9.5pt; }
  .no { text-align: right; font-size: 10.5pt; line-height: 1.6; }
  h1 { text-align: center; font-size: 20pt; margin: 10px 0 2px; letter-spacing: 1px; }
  .date-line { text-align: center; font-style: italic; font-size: 11pt; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 5px 0; vertical-align: top; }
  td.lbl { width: 38%; }
  td.val { width: 62%; font-weight: bold; }
  .dots { display: inline-block; width: 100%; border-bottom: 1px dotted #666; height: 1em; }
  .amount-box {
    margin: 10px 0 4px;
    padding: 8px 12px;
    border: 1.5px solid #000;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }
  .amount-box .k { font-size: 11pt; }
  .amount-box .v { font-size: 16pt; font-weight: bold; }
  .in-words { font-style: italic; margin-bottom: 12px; }
  .signs { display: flex; justify-content: space-between; margin-top: 18px; text-align: center; gap: 8px; }
  .signs div { flex: 1; font-size: 11pt; }
  .signs .role { font-weight: bold; }
  .signs .hint { font-style: italic; font-size: 9.5pt; }
  .signs .space { height: 62px; }

  /* Mỗi phiếu một trang khi in / lưu PDF */
  .sheet { page-break-after: always; break-after: page; }
  .sheet:last-of-type { page-break-after: auto; break-after: auto; }

  @media screen {
    body { background: #f4f1ea; }
    .sheet {
      background: #fff;
      padding: 10mm;
      box-shadow: 0 6px 24px rgba(0,0,0,.15);
      max-width: 210mm;
      margin: 0 auto 18px;
    }
    .print-bar {
      max-width: 210mm;
      margin: 0 auto 12px;
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: flex-end;
      font-family: system-ui, sans-serif;
      font-size: 11pt;
    }
    .print-bar .count { margin-right: auto; color: #5f564e; }
    .print-bar button {
      font: inherit; padding: 9px 18px; border-radius: 8px;
      border: 1px solid #c0563a; background: #e2693e; color: #fff; cursor: pointer;
    }
  }
  @media print {
    .print-bar { display: none; }
    .sheet { box-shadow: none; padding: 0; margin: 0; max-width: none; }
  }
`;

/** Thân một phiếu (không kèm <html>), dùng lại cho cả in lẻ lẫn in gộp. */
const renderVoucherSheet = (expense: Expense): string => {
  const isIncome = expense.type === 'income';
  const title = isIncome ? 'PHIẾU THU' : 'PHIẾU CHI';
  const { day, month, year } = splitDate(expense.date);
  const counterpartyLabel = isIncome ? 'Họ tên người nộp tiền' : 'Họ tên người nhận tiền';
  const reason = [expense.note, expense.subCategory, expense.category].find((v) => v && v.trim()) ?? '';
  const method = expense.paymentMethod ? PAYMENT_METHOD_LABELS[expense.paymentMethod] : '';

  return `
  <div class="sheet">
    <div class="head">
      <div class="org">
        <div class="church">${escapeHtml(ORG.church)}</div>
        <div class="unit">${escapeHtml(ORG.unit)}</div>
        <div class="addr">${escapeHtml(ORG.address)}</div>
      </div>
      <div class="no">
        <div>Số: <b>${escapeHtml(expense.receiptNo ?? '.................')}</b></div>
        <div>Quyển số: ................</div>
      </div>
    </div>

    <h1>${title}</h1>
    <div class="date-line">Ngày ${day} tháng ${month} năm ${year}</div>

    <table>
      ${row(counterpartyLabel, expense.counterparty ?? '')}
      ${row('Lý do ' + (isIncome ? 'nộp' : 'chi'), reason)}
      ${row('Hạng mục', [expense.category, expense.subCategory].filter(Boolean).join(' — '))}
      ${expense.eventName ? row('Thuộc hoạt động', expense.eventName) : ''}
      ${method ? row('Hình thức thanh toán', method) : ''}
    </table>

    <div class="amount-box">
      <span class="k">Số tiền:</span>
      <span class="v">${formatMoneyPlain(expense.amount)} đ</span>
    </div>
    <div class="in-words">Bằng chữ: ${escapeHtml(amountToWords(expense.amount))}.</div>

    <div class="signs">
      <div>
        <div class="role">Trưởng Ban</div>
        <div class="hint">(Ký, họ tên)</div>
        <div class="space"></div>
      </div>
      <div>
        <div class="role">Thủ quỹ</div>
        <div class="hint">(Ký, họ tên)</div>
        <div class="space"></div>
        <div>${escapeHtml(expense.handledBy ?? '')}</div>
      </div>
      <div>
        <div class="role">Người lập phiếu</div>
        <div class="hint">(Ký, họ tên)</div>
        <div class="space"></div>
      </div>
      <div>
        <div class="role">${isIncome ? 'Người nộp tiền' : 'Người nhận tiền'}</div>
        <div class="hint">(Ký, họ tên)</div>
        <div class="space"></div>
        <div>${escapeHtml(expense.counterparty ?? '')}</div>
      </div>
    </div>
  </div>`;
};

/**
 * Dựng trang chứa một hoặc nhiều phiếu — mỗi phiếu in ra một trang riêng,
 * để "Lưu thành PDF" trong hộp thoại in ra đúng một file gộp.
 */
export const buildVoucherHtml = (expenses: Expense[]): string => {
  const count = expenses.length;
  const docTitle =
    count === 1
      ? `${expenses[0].type === 'income' ? 'Phiếu thu' : 'Phiếu chi'} ${expenses[0].receiptNo ?? ''}`.trim()
      : `${count} phiếu thu chi — Ban Thanh Niên`;

  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(docTitle)}</title>
<style>${VOUCHER_STYLES}</style>
</head>
<body>
  <div class="print-bar">
    <span class="count">${count} phiếu · mỗi phiếu một trang</span>
    <button onclick="window.print()">In / Lưu PDF</button>
  </div>
  ${expenses.map(renderVoucherSheet).join('\n')}
</body>
</html>`;
};

/**
 * Mở phiếu trong tab mới để xem trước rồi in / lưu PDF.
 * Trả về false nếu trình duyệt chặn popup (để màn hình báo cho người dùng).
 */
export const openVoucherWindow = (expenses: Expense | Expense[]): boolean => {
  const list = Array.isArray(expenses) ? expenses : [expenses];
  if (list.length === 0) return true;

  const win = window.open('', '_blank');
  if (!win) return false;
  win.document.write(buildVoucherHtml(list));
  win.document.close();
  return true;
};
