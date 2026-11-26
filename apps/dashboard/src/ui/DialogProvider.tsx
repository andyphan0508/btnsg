import { createContext, useCallback, useContext, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import Modal from './Modal';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type PromptOptions = {
  title: string;
  message?: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type ToastTone = 'ok' | 'error' | 'info';
type ToastItem = { id: number; message: string; tone: ToastTone };

type DialogContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
  notify: (message: string, tone?: ToastTone) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const [promptState, setPromptState] = useState<(PromptOptions & { resolve: (value: string | null) => void }) | null>(
    null,
  );
  const [promptValue, setPromptValue] = useState<string>('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setConfirmState({ ...options, resolve });
      }),
    [],
  );

  const prompt = useCallback(
    (options: PromptOptions) =>
      new Promise<string | null>((resolve) => {
        setPromptValue(options.defaultValue ?? '');
        setPromptState({ ...options, resolve });
      }),
    [],
  );

  const notify = useCallback((message: string, tone: ToastTone = 'ok') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  const closeConfirm = (result: boolean) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

  const closePrompt = (result: string | null) => {
    promptState?.resolve(result);
    setPromptState(null);
  };

  const handlePromptSubmit = (event: FormEvent) => {
    event.preventDefault();
    closePrompt(promptValue);
  };

  return (
    <DialogContext.Provider value={{ confirm, prompt, notify }}>
      {children}

      <Modal
        size="sm"
        isOpen={Boolean(confirmState)}
        title={confirmState?.title ?? 'Xác nhận'}
        onClose={() => closeConfirm(false)}
        footer={
          <>
            <button type="button" className="btn btn-outline" onClick={() => closeConfirm(false)}>
              {confirmState?.cancelLabel ?? 'Hủy'}
            </button>
            <button
              type="button"
              className={`btn ${confirmState?.danger ? 'btn-danger' : 'btn-primary'}`}
              onClick={() => closeConfirm(true)}
            >
              {confirmState?.confirmLabel ?? 'Xác nhận'}
            </button>
          </>
        }
      >
        <p style={{ whiteSpace: 'pre-line', color: 'var(--ink-2)', lineHeight: 1.6 }}>{confirmState?.message}</p>
      </Modal>

      <Modal
        size="sm"
        isOpen={Boolean(promptState)}
        title={promptState?.title ?? 'Nhập thông tin'}
        onClose={() => closePrompt(null)}
        footer={
          <>
            <button type="button" className="btn btn-outline" onClick={() => closePrompt(null)}>
              {promptState?.cancelLabel ?? 'Hủy'}
            </button>
            <button type="submit" form="dialog-prompt-form" className="btn btn-primary">
              {promptState?.confirmLabel ?? 'Lưu'}
            </button>
          </>
        }
      >
        <form id="dialog-prompt-form" onSubmit={handlePromptSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {promptState?.message && <p style={{ color: 'var(--ink-2)', fontSize: '0.88rem' }}>{promptState.message}</p>}
          <div className="field" style={{ margin: 0 }}>
            {promptState?.label && <label className="field-label">{promptState.label}</label>}
            <input
              className="input"
              autoFocus
              value={promptValue}
              placeholder={promptState?.placeholder}
              onChange={(e) => setPromptValue(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {toasts.length > 0 && (
        <div className="toast-stack" role="region" aria-label="Thông báo">
          {toasts.map((t) => (
            <div key={t.id} className={`toast toast--${t.tone}`}>
              {t.tone === 'error' ? <FiAlertCircle /> : t.tone === 'info' ? <FiInfo /> : <FiCheckCircle />}
              <span style={{ flex: 1 }}>{t.message}</span>
              <button
                type="button"
                className="toast-close"
                aria-label="Đóng thông báo"
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              >
                <FiX />
              </button>
            </div>
          ))}
        </div>
      )}
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextValue => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used inside DialogProvider');
  return ctx;
};
