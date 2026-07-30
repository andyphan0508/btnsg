import { useEffect, useMemo, useState } from 'react';
import type { Expense } from '@btnsg/shared';
import { EXPENSE_CATEGORIES } from '@btnsg/shared';
import { expenseApi } from '../../api/resourceApi';
import LoadingState from '../../ui/LoadingState';
import { exportFinanceWorkbook } from '../../utils/financeExcel';
import { openVoucherWindow } from '../../utils/voucher';
import ExpenseFormModal, { type ExpenseFormValues } from './components/ExpenseFormModal';
import ExpenseTable from './components/ExpenseTable';
import FinanceAnalytics from './components/FinanceAnalytics';
import FinanceSummary from './components/FinanceSummary';
import { FiDownload, FiPrinter } from 'react-icons/fi';

const FinanceScreen = () => {
  // 1. State declarations
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState<boolean>(false);
  const [expenseListError, setExpenseListError] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSavingExpense, setIsSavingExpense] = useState<boolean>(false);
  const [saveExpenseError, setSaveExpenseError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // 2. Logic functions
  const validateExpenseForm = (values: ExpenseFormValues): boolean => {
    if (!values.date) return false;
    if (!values.category) return false;
    const amount = Number(values.amount);
    if (Number.isNaN(amount) || amount <= 0) return false;
    return true;
  };

  const filteredExpenses = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    const sorted = [...expenseList].sort((a, b) => b.date.localeCompare(a.date));
    return sorted.filter((expense) => {
      if (typeFilter !== 'all' && expense.type !== typeFilter) return false;
      if (monthFilter && !expense.date.startsWith(monthFilter)) return false;
      if (categoryFilter !== 'all' && expense.category !== categoryFilter) return false;
      if (!keyword) return true;
      const haystack = [
        expense.category,
        expense.subCategory,
        expense.note,
        expense.counterparty,
        expense.handledBy,
        expense.receiptNo,
        expense.eventName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [expenseList, typeFilter, monthFilter, categoryFilter, searchKeyword]);

  /** Gợi ý tên hoạt động đã dùng, cho ô "Thuộc hoạt động" trong form. */
  const eventOptions = useMemo(() => {
    const events = new Set<string>();
    expenseList.forEach((expense) => {
      if (expense.eventName) events.add(expense.eventName);
    });
    return [...events].sort((a, b) => a.localeCompare(b, 'vi'));
  }, [expenseList]);

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
        subCategory: values.subCategory || undefined,
        paymentMethod: values.paymentMethod || undefined,
        receiptNo: values.receiptNo || undefined,
        counterparty: values.counterparty || undefined,
        handledBy: values.handledBy || undefined,
        eventName: values.eventName || undefined,
        attachmentUrl: values.attachmentUrl || undefined,
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

  const handlePrintVoucher = (expense: Expense) => {
    const opened = openVoucherWindow(expense);
    if (!opened) {
      setExpenseListError('Trình duyệt đã chặn cửa sổ in phiếu — hãy cho phép pop-up cho trang này.');
    }
  };

  /** In gộp các phiếu đang chọn — mỗi phiếu một trang trong cùng một file PDF. */
  const handlePrintSelected = () => {
    const chosen = filteredExpenses.filter((expense) => selectedIds.has(expense.id));
    if (chosen.length === 0) return;
    const opened = openVoucherWindow(chosen);
    if (!opened) {
      setExpenseListError('Trình duyệt đã chặn cửa sổ in phiếu — hãy cho phép pop-up cho trang này.');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /** Chọn / bỏ chọn toàn bộ các dòng đang hiển thị theo bộ lọc hiện tại. */
  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const allSelected = filteredExpenses.length > 0 && filteredExpenses.every((e) => prev.has(e.id));
      if (allSelected) return new Set();
      return new Set(filteredExpenses.map((e) => e.id));
    });
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      setExpenseListError(null);
      // Xuất đúng phần đang lọc để thủ quỹ chốt sổ theo tháng/hạng mục tuỳ ý.
      const today = new Date().toISOString().slice(0, 10);
      await exportFinanceWorkbook(filteredExpenses, `so-quy-btnsg-${today}.xlsx`);
    } catch (error) {
      setExpenseListError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsExporting(false);
    }
  };

  // Chỉ đếm những lựa chọn còn nằm trong danh sách đang lọc.
  const selectedCount = filteredExpenses.filter((expense) => selectedIds.has(expense.id)).length;

  const hasFilter =
    typeFilter !== 'all' || monthFilter !== '' || categoryFilter !== 'all' || searchKeyword !== '';

  const clearFilters = () => {
    setTypeFilter('all');
    setMonthFilter('');
    setCategoryFilter('all');
    setSearchKeyword('');
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
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportExcel}
            disabled={isExporting || filteredExpenses.length === 0}
            title="Xuất sổ quỹ (giao dịch + tổng hợp tháng + cơ cấu hạng mục)"
          >
            {isExporting ? 'Đang xuất…' : <><FiDownload /> Xuất sổ quỹ Excel</>}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            + Ghi giao dịch
          </button>
        </div>
      </div>

      <FinanceSummary expenses={filteredExpenses} />

      <FinanceAnalytics expenses={expenseList} />

      <div className="toolbar">
        <input
          className="input"
          placeholder="Tìm theo ghi chú, người nhận, số phiếu, hoạt động…"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <select className="select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">Thu &amp; chi</option>
          <option value="income">Chỉ khoản thu</option>
          <option value="expense">Chỉ khoản chi</option>
        </select>
        <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">Tất cả hạng mục</option>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <input
          type="month"
          className="input"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          title="Lọc theo tháng"
        />
        {hasFilter && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
            Bỏ lọc
          </button>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="bulk-bar">
          <span className="bulk-count">Đã chọn {selectedCount} giao dịch</span>
          <button type="button" className="btn btn-primary btn-sm" onClick={handlePrintSelected}>
            <FiPrinter /> Tải {selectedCount} phiếu (PDF gộp)
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedIds(new Set())}>
            Bỏ chọn
          </button>
        </div>
      )}

      {expenseListError && <div className="form-error" style={{ marginBottom: 14 }}>{expenseListError}</div>}
      {isLoadingExpenses && expenseList.length === 0 ? (
        <LoadingState />
      ) : (
        <ExpenseTable
          expenses={filteredExpenses}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onEdit={handleOpenEdit}
          onDelete={deleteExpense}
          onPrintVoucher={handlePrintVoucher}
        />
      )}

      <ExpenseFormModal
        isOpen={isFormOpen}
        editingExpense={editingExpense}
        isSaving={isSavingExpense}
        saveError={saveExpenseError}
        eventOptions={eventOptions}
        onClose={() => setIsFormOpen(false)}
        onSubmit={submitExpenseForm}
      />
    </div>
  );
};

export default FinanceScreen;
