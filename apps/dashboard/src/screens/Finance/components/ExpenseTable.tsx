import type { Expense } from '@btnsg/shared';
import EmptyState from '../../../ui/EmptyState';
import { formatDate, formatMoney } from '../../../utils/format';

type ExpenseTableProps = {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
};

const ExpenseTable = ({ expenses, onEdit, onDelete }: ExpenseTableProps) => {
  if (expenses.length === 0) {
    return (
      <div className="table-wrap">
        <EmptyState icon="💰" title="Chưa có giao dịch" hint="Ghi lại các khoản thu và chi của quỹ Ban." />
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Loại</th>
            <th>Hạng mục</th>
            <th>Số tiền</th>
            <th>Ghi chú</th>
            <th style={{ textAlign: 'right' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td className="cell-muted">{formatDate(expense.date)}</td>
              <td>
                {expense.type === 'income' ? (
                  <span className="badge badge-green">Thu</span>
                ) : (
                  <span className="badge badge-red">Chi</span>
                )}
              </td>
              <td className="cell-strong">{expense.category}</td>
              <td>
                <span className="cell-strong" style={{ color: expense.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                  {expense.type === 'income' ? '+' : '−'}{formatMoney(expense.amount)}
                </span>
              </td>
              <td className="cell-muted">{expense.note ?? '—'}</td>
              <td>
                <div className="cell-actions">
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
