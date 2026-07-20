import { useEffect, useMemo, useState } from 'react';
import type { Expense } from '@btnsg/shared';
import { expenseApi } from '../../api/resourceApi';
import LoadingState from '../../ui/LoadingState';
import ExpenseFormModal, { type ExpenseFormValues } from './components/ExpenseFormModal';
import ExpenseTable from './components/ExpenseTable';
import FinanceSummary from './components/FinanceSummary';

const FinanceScreen = () => {
  // 1. State declarations
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState<boolean>(false);
  const [expenseListError, setExpenseListError] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('');

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSavingExpense, setIsSavingExpense] = useState<boolean>(false);
  const [saveExpenseError, setSaveExpenseError] = useState<string | null>(null);

  // 2. Logic functions
  const validateExpenseForm = (values: ExpenseFormValues): boolean => {
    if (!values.date) return false;
    if (!values.category) return false;
    const amount = Number(values.amount);
    if (Number.isNaN(amount) || amount <= 0) return false;
    return true;
  };

  const filteredExpenses = useMemo(() => {
    const sorted = [...expenseList].sort((a, b) => b.date.localeCompare(a.date));
    return sorted.filter((expense) => {
      if (typeFilter !== 'all' && expense.type !== typeFilter) return false;
      if (monthFilter && !expense.date.startsWith(monthFilter)) return false;
      return true;
    });
  }, [expenseList, typeFilter, monthFilter]);

  // 3. API call functions
  const fetchExpenseList = async (): Promise<boolean> => {
    try {
      setIsLoadingExpenses(true);
      const data = await expenseApi.getList();
      setExpenseList(data);
      return true;
    } catch (error) {
      setExpenseListError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  const submitExpenseForm = async (values: ExpenseFormValues): Promise<boolean> => {
    if (!validateExpenseForm(values)) {
      setSaveExpenseError('Vui lòng nhập đủ ngày, hạng mục và số tiền hợp lệ.');
      return false;
    }

    try {
      setIsSavingExpense(true);
      setSaveExpenseError(null);
      const payload = {
        date: values.date,
        type: values.type,
        category: values.category,
        amount: Number(values.amount),
        note: values.note || undefined,
      };
      if (editingExpense) {
        await expenseApi.update(editingExpense.id, payload);
      } else {
        await expenseApi.create(payload);
      }
      setIsFormOpen(false);
      await fetchExpenseList();
      return true;
    } catch (error) {
      setSaveExpenseError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsSavingExpense(false);
    }
  };

  const deleteExpense = async (expense: Expense): Promise<boolean> => {
    const confirmed = window.confirm(`Xoá giao dịch "${expense.category}" ngày ${expense.date}?`);
    if (!confirmed) return false;

    try {
      await expenseApi.remove(expense.id);
      await fetchExpenseList();
      return true;
    } catch (error) {
      setExpenseListError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  // 4. Effects
  useEffect(() => {
    fetchExpenseList();
  }, []);

  // 5. Handlers
  const handleOpenCreate = () => {
    setEditingExpense(null);
    setSaveExpenseError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setSaveExpenseError(null);
    setIsFormOpen(true);
  };

  // 6. Render
  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Tài chính</span>
          <h2>Quản lý thu chi</h2>
          <p className="page-sub">Minh bạch quỹ Ban — ghi nhận từng khoản thu và chi.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          + Ghi giao dịch
        </button>
      </div>

      <FinanceSummary expenses={filteredExpenses} />

      <div className="toolbar">
        <select className="select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">Thu &amp; chi</option>
          <option value="income">Chỉ khoản thu</option>
          <option value="expense">Chỉ khoản chi</option>
        </select>
        <input
          type="month"
          className="input"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          title="Lọc theo tháng"
        />
        {monthFilter && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMonthFilter('')}>
            Bỏ lọc tháng
          </button>
        )}
      </div>

      {expenseListError && <div className="form-error" style={{ marginBottom: 14 }}>{expenseListError}</div>}
      {isLoadingExpenses && expenseList.length === 0 ? (
        <LoadingState />
      ) : (
        <ExpenseTable expenses={filteredExpenses} onEdit={handleOpenEdit} onDelete={deleteExpense} />
      )}

      <ExpenseFormModal
        isOpen={isFormOpen}
        editingExpense={editingExpense}
        isSaving={isSavingExpense}
        saveError={saveExpenseError}
        onClose={() => setIsFormOpen(false)}
        onSubmit={submitExpenseForm}
      />
    </div>
  );
};

export default FinanceScreen;
