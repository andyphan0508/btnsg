import { useEffect, useState } from 'react';
import type { Expense, ExpenseType } from '@btnsg/shared';
import { EXPENSE_CATEGORIES } from '@btnsg/shared';
import Modal from '../../../ui/Modal';
import { todayIsoDate } from '../../../utils/format';

export type ExpenseFormValues = {
  date: string;
  type: ExpenseType;
  category: string;
  amount: string;
  note: string;
};

const EMPTY_FORM: ExpenseFormValues = {
  date: todayIsoDate(),
  type: 'expense',
  category: EXPENSE_CATEGORIES[0],
  amount: '',
  note: '',
};

type ExpenseFormModalProps = {
  isOpen: boolean;
  editingExpense: Expense | null;
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSubmit: (values: ExpenseFormValues) => void;
};

const ExpenseFormModal = ({ isOpen, editingExpense, isSaving, saveError, onClose, onSubmit }: ExpenseFormModalProps) => {
  const [formValues, setFormValues] = useState<ExpenseFormValues>(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;
    if (!editingExpense) {
      setFormValues({ ...EMPTY_FORM, date: todayIsoDate() });
      return;
    }
    setFormValues({
      date: editingExpense.date,
      type: editingExpense.type,
      category: editingExpense.category,
      amount: String(editingExpense.amount),
      note: editingExpense.note ?? '',
    });
  }, [isOpen, editingExpense]);

  const setField = <K extends keyof ExpenseFormValues>(field: K, value: ExpenseFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      title={editingExpense ? 'Cập nhật giao dịch' : 'Ghi giao dịch mới'}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
          <button type="button" className="btn btn-primary" disabled={isSaving} onClick={() => onSubmit(formValues)}>
            {isSaving ? 'Đang lưu…' : 'Lưu giao dịch'}
          </button>
        </>
      }
    >
      {saveError && <div className="form-error">{saveError}</div>}
      <div className="form-grid">
        <div className="field">
          <label className="field-label">Loại giao dịch</label>
          <select className="select" value={formValues.type} onChange={(e) => setField('type', e.target.value as ExpenseType)}>
            <option value="income">Thu (vào quỹ)</option>
            <option value="expense">Chi (ra quỹ)</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">Ngày *</label>
          <input type="date" className="input" value={formValues.date} onChange={(e) => setField('date', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Hạng mục *</label>
          <select className="select" value={formValues.category} onChange={(e) => setField('category', e.target.value)}>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Số tiền (VND) *</label>
          <input
            type="number"
            min="0"
            step="1000"
            className="input"
            placeholder="VD: 500000"
            value={formValues.amount}
            onChange={(e) => setField('amount', e.target.value)}
          />
        </div>
        <div className="field span-2">
          <label className="field-label">Ghi chú</label>
          <textarea className="textarea" value={formValues.note} onChange={(e) => setField('note', e.target.value)} />
        </div>
      </div>
    </Modal>
  );
};

export default ExpenseFormModal;
