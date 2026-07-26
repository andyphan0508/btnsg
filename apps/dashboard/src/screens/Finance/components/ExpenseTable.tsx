import type { Expense } from '@btnsg/shared';
import { PAYMENT_METHOD_LABELS } from '@btnsg/shared';
import EmptyState from '../../../ui/EmptyState';
import { formatDate, formatMoney } from '../../../utils/format';

type ExpenseTableProps = {
  expenses: Expense[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onPrintVoucher: (expense: Expense) => void;
};

const ExpenseTable = ({
  expenses,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  onPrintVoucher,
}: ExpenseTableProps) => {
  if (expenses.length === 0) {
    return (
      <div className="table-wrap">
        <EmptyState icon="💰" title="Chưa có giao dịch" hint="Ghi lại các khoản thu và chi của quỹ Ban." />
      </div>
    );
  }

  const allSelected = expenses.length > 0 && expenses.every((expense) => selectedIds.has(expense.id));

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 34 }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                aria-label="Chọn tất cả giao dịch đang hiển thị"
              />
            </th>
            <th>Ngày</th>
            <th>Loại</th>
            <th>Hạng mục</th>
            <th>Đối tượng</th>
            <th>Chứng từ</th>
            <th style={{ textAlign: 'right' }}>Số tiền</th>
            <th style={{ textAlign: 'right' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className={selectedIds.has(expense.id) ? 'row-selected' : undefined}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.has(expense.id)}
                  onChange={() => onToggleSelect(expense.id)}
                  aria-label={`Chọn giao dịch ${expense.category} ngày ${expense.date}`}
                />
              </td>
              <td className="cell-muted">
                {formatDate(expense.date)}
                {expense.eventName && <div className="cell-muted">🎪 {expense.eventName}</div>}
              </td>
              <td>
                {expense.type === 'income' ? (
                  <span className="badge badge-green">Thu</span>
                ) : (
                  <span className="badge badge-red">Chi</span>
                )}
              </td>
              <td>
                <span className="cell-strong">{expense.category}</span>
                {expense.subCategory && <div className="cell-muted">{expense.subCategory}</div>}
                {expense.note && <div className="cell-muted">{expense.note}</div>}
              </td>
              <td>
                <div className="cell-muted">{expense.counterparty ?? '—'}</div>
                {expense.handledBy && <div className="cell-muted">TQ: {expense.handledBy}</div>}
              </td>
              <td>
                {expense.receiptNo && <div className="cell-muted">{expense.receiptNo}</div>}
                {expense.paymentMethod && (
                  <span className="badge badge-grey">{PAYMENT_METHOD_LABELS[expense.paymentMethod]}</span>
                )}
                {expense.attachmentUrl && (
                  <div>
                    <a className="cell-muted" href={expense.attachmentUrl} target="_blank" rel="noopener noreferrer">
                      📎 Chứng từ
                    </a>
                  </div>
                )}
                {!expense.receiptNo && !expense.paymentMethod && !expense.attachmentUrl && (
                  <span className="cell-muted">—</span>
                )}
              </td>
              <td style={{ textAlign: 'right' }}>
                <span
                  className="cell-strong"
                  style={{ color: expense.type === 'income' ? 'var(--green)' : 'var(--red)' }}
                >
                  {expense.type === 'income' ? '+' : '−'}{formatMoney(expense.amount)}
                </span>
              </td>
              <td>
                <div className="cell-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    title="Xuất phiếu để in / ký"
                    onClick={() => onPrintVoucher(expense)}
                  >
                    🧾
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => onEdit(expense)}>Sửa</button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(expense)}>Xoá</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
