import { useEffect, useState } from 'react';
import type { Expense, ExpenseType, PaymentMethod } from '@btnsg/shared';
import {
  EXPENSE_CATEGORIES,
  EXPENSE_SUBCATEGORIES,
  PAYMENT_METHOD_LABELS,
  amountToWords,
} from '@btnsg/shared';
import Modal from '../../../ui/Modal';
import { todayIsoDate } from '../../../utils/format';

export type ExpenseFormValues = {
  date: string;
  type: ExpenseType;
  category: string;
  subCategory: string;
  amount: string;
  paymentMethod: '' | PaymentMethod;
  receiptNo: string;
  counterparty: string;
  handledBy: string;
  eventName: string;
  attachmentUrl: string;
  note: string;
};

const EMPTY_FORM: ExpenseFormValues = {
  date: todayIsoDate(),
  type: 'expense',
  category: EXPENSE_CATEGORIES[0],
  subCategory: '',
  amount: '',
  paymentMethod: 'cash',
  receiptNo: '',
  counterparty: '',
  handledBy: '',
  eventName: '',
  attachmentUrl: '',
  note: '',
};

type ExpenseFormModalProps = {
  isOpen: boolean;
  editingExpense: Expense | null;
  isSaving: boolean;
  saveError: string | null;
  /** Gợi ý sẵn các hoạt động đã nhập trước đó. */
  eventOptions?: string[];
  onClose: () => void;
  onSubmit: (values: ExpenseFormValues) => void;
};

const ExpenseFormModal = ({
  isOpen,
  editingExpense,
  isSaving,
  saveError,
  eventOptions = [],
  onClose,
  onSubmit,
}: ExpenseFormModalProps) => {
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
      subCategory: editingExpense.subCategory ?? '',
      amount: String(editingExpense.amount),
      paymentMethod: editingExpense.paymentMethod ?? '',
      receiptNo: editingExpense.receiptNo ?? '',
      counterparty: editingExpense.counterparty ?? '',
      handledBy: editingExpense.handledBy ?? '',
      eventName: editingExpense.eventName ?? '',
      attachmentUrl: editingExpense.attachmentUrl ?? '',
      note: editingExpense.note ?? '',
    });
  }, [isOpen, editingExpense]);

  const setField = <K extends keyof ExpenseFormValues>(field: K, value: ExpenseFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const isIncome = formValues.type === 'income';
  const subOptions = EXPENSE_SUBCATEGORIES[formValues.category] ?? [];
  const amountNumber = Number(formValues.amount);
  const amountPreview =
    formValues.amount && !Number.isNaN(amountNumber) && amountNumber > 0 ? amountToWords(amountNumber) : '';

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
          <label className="field-label">Loại giao dịch *</label>
          <select
            className="select"
            value={formValues.type}
            onChange={(e) => setField('type', e.target.value as ExpenseType)}
          >
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
          <select
            className="select"
            value={formValues.category}
            onChange={(e) => {
              // Đổi hạng mục lớn → xoá hạng mục con cũ cho khỏi lệch ngữ cảnh.
              setFormValues((prev) => ({ ...prev, category: e.target.value, subCategory: '' }));
            }}
          >
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Hạng mục con</label>
          <input
            className="input"
            list="expense-subcategory-options"
            placeholder={subOptions[0] ? `VD: ${subOptions[0]}` : 'Chi tiết hơn hạng mục lớn'}
            value={formValues.subCategory}
            onChange={(e) => setField('subCategory', e.target.value)}
          />
          <datalist id="expense-subcategory-options">
            {subOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
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
          {amountPreview && <div className="cell-muted" style={{ marginTop: 4 }}>{amountPreview}</div>}
        </div>
        <div className="field">
          <label className="field-label">Hình thức</label>
          <select
            className="select"
            value={formValues.paymentMethod}
            onChange={(e) => setField('paymentMethod', e.target.value as ExpenseFormValues['paymentMethod'])}
          >
            <option value="">— Chưa rõ —</option>
            {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => (
              <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method]}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label">Số phiếu / chứng từ</label>
          <input
            className="input"
            placeholder="VD: PC-2026-001"
            value={formValues.receiptNo}
            onChange={(e) => setField('receiptNo', e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label">{isIncome ? 'Người nộp' : 'Người nhận'}</label>
          <input
            className="input"
            placeholder={isIncome ? 'Ai nộp khoản này?' : 'Chi cho ai?'}
            value={formValues.counterparty}
            onChange={(e) => setField('counterparty', e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field-label">Người ghi nhận / thủ quỹ</label>
          <input
            className="input"
            value={formValues.handledBy}
            onChange={(e) => setField('handledBy', e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label">Thuộc hoạt động</label>
          <input
            className="input"
            list="expense-event-options"
            placeholder="VD: Trại hè 2026"
            value={formValues.eventName}
            onChange={(e) => setField('eventName', e.target.value)}
          />
          <datalist id="expense-event-options">
            {eventOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>

        <div className="field span-2">
          <label className="field-label">Link chứng từ (ảnh hoá đơn trên Drive…)</label>
          <input
            className="input"
            placeholder="https://drive.google.com/…"
            value={formValues.attachmentUrl}
            onChange={(e) => setField('attachmentUrl', e.target.value)}
          />
        </div>
        <div className="field span-2">
          <label className="field-label">Ghi chú / lý do</label>
          <textarea className="textarea" value={formValues.note} onChange={(e) => setField('note', e.target.value)} />
        </div>
      </div>
    </Modal>
  );
};

export default ExpenseFormModal;
