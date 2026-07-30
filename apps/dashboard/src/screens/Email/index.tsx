import { useEffect, useMemo, useState } from 'react';
import {
  extractTemplateFields,
  fillTemplate,
  type EmailTemplate,
  type Member,
} from '@btnsg/shared';
import { emailApi, emailTemplateApi, memberApi } from '../../api/resourceApi';
import LoadingState from '../../ui/LoadingState';
import TemplateFormModal, { type TemplateFormValues } from './components/TemplateFormModal';
import { FiAlertTriangle, FiSend } from 'react-icons/fi';

/** Placeholder đặc biệt: tự thay bằng tên từng người nhận khi gửi. */
const RECIPIENT_NAME_FIELD = 'ten_nguoi_nhan';

const FIELD_LABEL_OVERRIDES: Record<string, string> = {
  chu_de: 'Chủ đề',
  thoi_gian: 'Thời gian',
  dia_diem: 'Địa điểm',
  noi_dung: 'Nội dung',
  nguoi_gui: 'Người gửi',
  ten_cong_tac: 'Tên công tác',
  phu_trach: 'Phụ trách',
  ghi_chu: 'Ghi chú',
  buoi_nhom: 'Buổi nhóm',
  ngay: 'Ngày',
  gio: 'Giờ',
  phan_cong: 'Phân công',
};

const fieldLabel = (field: string): string =>
  FIELD_LABEL_OVERRIDES[field] ?? field.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

const EmailScreen = () => {
  // 1. State
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<Set<string>>(new Set());

  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  const [isTemplateFormOpen, setIsTemplateFormOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  // 2. Derived
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) ?? null;

  const templateFields = useMemo(() => {
    if (!selectedTemplate) return [];
    return extractTemplateFields(selectedTemplate).filter((field) => field !== RECIPIENT_NAME_FIELD);
  }, [selectedTemplate]);

  const boardRecipients = useMemo(
    () => members.filter((m) => m.role === 'leader' && m.status === 'active'),
    [members],
  );
  const recipientsWithEmail = useMemo(() => boardRecipients.filter((m) => m.email), [boardRecipients]);
  const recipientsWithoutEmail = useMemo(() => boardRecipients.filter((m) => !m.email), [boardRecipients]);

  const previewSubject = selectedTemplate ? fillTemplate(selectedTemplate.subject, fieldValues) : '';
  const previewBody = selectedTemplate ? fillTemplate(selectedTemplate.body, fieldValues) : '';

  const selectedRecipients = recipientsWithEmail.filter((m) => selectedRecipientIds.has(m.id));

  // 3. API calls
  const fetchAll = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const [templateList, memberList] = await Promise.all([emailTemplateApi.getList(), memberApi.getList()]);
      setTemplates(templateList);
      setMembers(memberList);
      if (templateList.length > 0) {
        setSelectedTemplateId((current) => current || templateList[0].id);
      }
      // Mặc định chọn hết BĐH có email
      setSelectedRecipientIds(
        new Set(memberList.filter((m) => m.role === 'leader' && m.status === 'active' && m.email).map((m) => m.id)),
      );
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmails = async (): Promise<void> => {
    if (!selectedTemplate) return;
    setSendError(null);
    setSendSuccess(null);

    const missingFields = templateFields.filter((field) => !fieldValues[field]?.trim());
    if (missingFields.length > 0) {
      setSendError(`Vui lòng điền: ${missingFields.map(fieldLabel).join(', ')}.`);
      return;
    }
    if (selectedRecipients.length === 0) {
      setSendError('Chọn ít nhất một người nhận trong BĐH.');
      return;
    }

    try {
      setIsSending(true);
      const result = await emailApi.sendBulk({
        subject: previewSubject,
        body: previewBody,
        recipients: selectedRecipients.map((m) => ({ name: m.name, email: m.email! })),
      });
      setSendSuccess(
        result.demo
          ? `(Chế độ demo) Đã mô phỏng gửi ${result.sent} email — cấu hình VITE_APPS_SCRIPT_URL để gửi thật.`
          : `Đã gửi ${result.sent} email cho Ban Điều Hành.`,
      );
    } catch (error) {
      setSendError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSending(false);
    }
  };

  const submitTemplateForm = async (values: TemplateFormValues): Promise<void> => {
    if (!values.name.trim() || !values.subject.trim() || !values.body.trim()) {
      setTemplateError('Vui lòng nhập đủ tên, tiêu đề và nội dung template.');
      return;
    }
    try {
      setIsSavingTemplate(true);
      setTemplateError(null);
      if (editingTemplate) {
        await emailTemplateApi.update(editingTemplate.id, values);
      } else {
        const created = await emailTemplateApi.create(values);
        setSelectedTemplateId(created.id);
      }
      setIsTemplateFormOpen(false);
      const templateList = await emailTemplateApi.getList();
      setTemplates(templateList);
    } catch (error) {
      setTemplateError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const deleteTemplate = async (template: EmailTemplate): Promise<void> => {
    if (!window.confirm(`Xoá template "${template.name}"?`)) return;
    try {
      await emailTemplateApi.remove(template.id);
      const templateList = await emailTemplateApi.getList();
      setTemplates(templateList);
      if (selectedTemplateId === template.id) {
        setSelectedTemplateId(templateList[0]?.id ?? '');
        setFieldValues({});
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));
    }
  };

  // 4. Effects
  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    // Đổi template → reset giá trị các trường
    setFieldValues({});
    setSendError(null);
    setSendSuccess(null);
  }, [selectedTemplateId]);

  // 5. Handlers
  const toggleRecipient = (id: string) => {
    setSelectedRecipientIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllRecipients = () => {
    setSelectedRecipientIds((prev) =>
      prev.size === recipientsWithEmail.length ? new Set() : new Set(recipientsWithEmail.map((m) => m.id)),
    );
  };

  // 6. Render
  if (isLoading) return <LoadingState />;

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Liên lạc</span>
          <h2>Gửi email Ban Điều Hành</h2>
          <p className="page-sub">
            Chọn template, điền các trường — nội dung tự động điền vào template và gửi hàng loạt cho BĐH.
          </p>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => {
            setEditingTemplate(null);
            setTemplateError(null);
            setIsTemplateFormOpen(true);
          }}
        >
          + Template mới
        </button>
      </div>

      {loadError && <div className="form-error" style={{ marginBottom: 14 }}>{loadError}</div>}
      {!emailApi.isConfigured() && (
        <div style={styles.demoNote}>
          Chưa cấu hình <code>VITE_APPS_SCRIPT_URL</code> — email sẽ chỉ được mô phỏng, không gửi thật.
          Xem hướng dẫn triển khai Google Apps Script trong <code>DEPLOY.md</code>.
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Cột trái: template + các trường */}
        <div style={styles.column}>
          <div className="card">
            <div className="card-title">1. Chọn template</div>
            <div style={styles.templateList}>
              {templates.map((template) => (
                <div
                  key={template.id}
                  style={{
                    ...styles.templateItem,
                    ...(template.id === selectedTemplateId ? styles.templateItemActive : {}),
                  }}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <div>
                    <div className="cell-strong">{template.name}</div>
                    {template.description && <div className="cell-muted">{template.description}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTemplate(template);
                        setTemplateError(null);
                        setIsTemplateFormOpen(true);
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTemplate(template);
                      }}
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              ))}
              {templates.length === 0 && (
                <div className="cell-muted">Chưa có template nào — bấm “+ Template mới”.</div>
              )}
            </div>
          </div>

          {selectedTemplate && (
            <div className="card">
              <div className="card-title">2. Điền các trường</div>
              {templateFields.length === 0 && (
                <div className="cell-muted">Template này không có trường cần điền.</div>
              )}
              <div className="form-grid">
                {templateFields.map((field) => (
                  <div className="field span-2" key={field}>
                    <label className="field-label">{fieldLabel(field)}</label>
                    <input
                      className="input"
                      value={fieldValues[field] ?? ''}
                      placeholder={`{{${field}}}`}
                      onChange={(e) =>
                        setFieldValues((prev) => ({ ...prev, [field]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="cell-muted" style={{ marginTop: 8 }}>
                Mẹo: dùng {'{{ten_nguoi_nhan}}'} trong template để tự điền tên từng người nhận khi gửi.
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-title">3. Người nhận (Ban Điều Hành)</div>
            <label style={styles.recipientRow}>
              <input
                type="checkbox"
                checked={selectedRecipientIds.size === recipientsWithEmail.length && recipientsWithEmail.length > 0}
                onChange={toggleAllRecipients}
              />
              <span className="cell-strong">Chọn tất cả ({recipientsWithEmail.length})</span>
            </label>
            <div style={styles.recipientList}>
              {recipientsWithEmail.map((member) => (
                <label key={member.id} style={styles.recipientRow}>
                  <input
                    type="checkbox"
                    checked={selectedRecipientIds.has(member.id)}
                    onChange={() => toggleRecipient(member.id)}
                  />
                  <span>{member.name}</span>
                  <span className="cell-muted">{member.boardRole ?? ''}</span>
                  <span className="cell-muted" style={{ marginLeft: 'auto' }}>{member.email}</span>
                </label>
              ))}
              {recipientsWithEmail.length === 0 && (
                <div className="cell-muted">
                  Chưa có thành viên BĐH nào có email — bổ sung email trong mục Thành viên.
                </div>
              )}
            </div>
            {recipientsWithoutEmail.length > 0 && (
              <div style={styles.warning}>
                <FiAlertTriangle /> {recipientsWithoutEmail.length} thành viên BĐH chưa có email:{' '}
                {recipientsWithoutEmail.map((m) => m.name).join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Cột phải: preview + gửi */}
        <div style={styles.column}>
          <div className="card">
            <div className="card-title">Xem trước email</div>
            {selectedTemplate ? (
              <>
                <div style={styles.previewSubject}>{previewSubject}</div>
                <pre style={styles.previewBody}>{previewBody}</pre>
              </>
            ) : (
              <div className="cell-muted">Chọn một template để xem trước.</div>
            )}
          </div>

          {sendError && <div className="form-error">{sendError}</div>}
          {sendSuccess && <div style={styles.success}>{sendSuccess}</div>}

          <button
            className="btn btn-primary"
            disabled={isSending || !selectedTemplate}
            onClick={sendEmails}
            style={{ width: '100%' }}
          >
            {isSending ? 'Đang gửi…' : <><FiSend /> Gửi cho {selectedRecipients.length} người trong BĐH</>}
          </button>
        </div>
      </div>

      <TemplateFormModal
        isOpen={isTemplateFormOpen}
        editingTemplate={editingTemplate}
        isSaving={isSavingTemplate}
        saveError={templateError}
        onClose={() => setIsTemplateFormOpen(false)}
        onSubmit={submitTemplateForm}
      />
    </div>
  );
};

export default EmailScreen;

const styles = {
  column: { display: 'flex', flexDirection: 'column' as const, gap: 16 },
  demoNote: {
    background: 'rgba(240, 193, 75, 0.16)',
    color: '#9a7415',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: '0.84rem',
    marginBottom: 16,
  },
  templateList: { display: 'flex', flexDirection: 'column' as const, gap: 8 },
  templateItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--line, #e5decf)',
    cursor: 'pointer',
  },
  templateItemActive: {
    borderColor: 'var(--brand)',
    background: 'var(--brand-soft)',
  },
  recipientList: { display: 'flex', flexDirection: 'column' as const, gap: 4, marginTop: 4 },
  recipientRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 8px',
    borderRadius: 8,
    fontSize: '0.86rem',
    cursor: 'pointer',
  },
  warning: {
    marginTop: 10,
    fontSize: '0.78rem',
    color: '#9a7415',
    background: 'rgba(240, 193, 75, 0.16)',
    borderRadius: 8,
    padding: '8px 10px',
  },
  previewSubject: {
    fontWeight: 800,
    fontSize: '0.95rem',
    padding: '8px 12px',
    background: 'var(--surface-2)',
    borderRadius: 8,
    marginBottom: 10,
  },
  previewBody: {
    whiteSpace: 'pre-wrap' as const,
    fontFamily: 'inherit',
    fontSize: '0.88rem',
    lineHeight: 1.6,
    color: 'var(--ink-2)',
    background: 'var(--surface-2)',
    borderRadius: 8,
    padding: '12px 14px',
    margin: 0,
    maxHeight: 420,
    overflowY: 'auto' as const,
  },
  success: {
    background: 'var(--green-soft)',
    color: 'var(--green)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: '0.85rem',
  },
};
