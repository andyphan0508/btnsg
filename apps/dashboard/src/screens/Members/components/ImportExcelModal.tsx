import { useRef, useState } from 'react';
import { computeAge, MEMBER_STAGE_LABELS, computeStage } from '@btnsg/shared';
import Modal from '../../../ui/Modal';
import { parseMembersExcel, type ExcelParseResult, type ParsedMemberRow } from '../../../utils/excel';

type ImportExcelModalProps = {
  isOpen: boolean;
  isImporting: boolean;
  importError: string | null;
  onClose: () => void;
  onImport: (rows: ParsedMemberRow[]) => void;
};

const PREVIEW_LIMIT = 50;

const ImportExcelModal = ({ isOpen, isImporting, importError, onClose, onImport }: ImportExcelModalProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const resetState = () => {
    setFileName('');
    setParseResult(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = async (file: File | undefined) => {
    setParseResult(null);
    setParseError(null);
    if (!file) return;
    setFileName(file.name);
    try {
      const result = await parseMembersExcel(file);
      setParseResult(result);
      if (result.rows.length === 0 && result.errors.length > 0) {
        setParseError(result.errors[0]);
      }
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Không đọc được file Excel.');
    }
  };

  const rows = parseResult?.rows ?? [];

  return (
    <Modal
      title="Import danh sách từ Excel"
      isOpen={isOpen}
      onClose={handleClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={handleClose}>Huỷ</button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={rows.length === 0 || isImporting}
            onClick={() => onImport(rows)}
          >
            {isImporting ? 'Đang import…' : `Import ${rows.length} thành viên`}
          </button>
        </>
      }
    >
      <div style={styles.uploadRow}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={(e) => handleFileChange(e.target.files?.[0])}
        />
        <button type="button" className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
          📂 Chọn file Excel
        </button>
        <span className="cell-muted">{fileName || 'Chưa chọn file (.xlsx, .xls, .csv)'}</span>
      </div>

      <div style={styles.note}>
        File cần dòng tiêu đề với các cột như: <em>Họ tên, Giới tính, Ngày sinh, SĐT, Email, Vai trò, Chức vụ,
        Nhiệm vụ, Nhóm nhỏ, Ngày tham gia, Trạng thái, Giai đoạn, Ghi chú</em>. Chỉ cột <strong>Họ tên</strong> là bắt buộc —
        tên cột không phân biệt hoa thường/dấu.
      </div>

      {parseError && <div className="form-error">{parseError}</div>}
      {importError && <div className="form-error">{importError}</div>}

      {parseResult && rows.length > 0 && (
        <>
          <div style={styles.summary}>
            Nhận diện {parseResult.matchedColumns.length} cột · Đọc được <strong>{rows.length}</strong> thành viên
            {parseResult.errors.length > 0 && ` · ${parseResult.errors.length} dòng lỗi bị bỏ qua`}
          </div>
          {parseResult.errors.length > 0 && (
            <ul style={styles.errorList}>
              {parseResult.errors.slice(0, 5).map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
          <div className="table-wrap" style={styles.previewWrap}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Ngày sinh</th>
                  <th>Tuổi</th>
                  <th>Giai đoạn</th>
                  <th>Nhóm</th>
                  <th>Vai trò</th>
                  <th>Liên hệ</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, PREVIEW_LIMIT).map((row, index) => {
                  const stage = computeStage(row);
                  return (
                    <tr key={`${row.name}-${index}`}>
                      <td className="cell-strong">{row.name}</td>
                      <td className="cell-muted">{row.birthday ?? '—'}</td>
                      <td className="cell-muted">{computeAge(row.birthday) ?? '—'}</td>
                      <td className="cell-muted">{stage ? MEMBER_STAGE_LABELS[stage] : '—'}</td>
                      <td className="cell-muted">{row.group ?? '—'}</td>
                      <td className="cell-muted">{row.role === 'leader' ? 'BĐH' : 'Ban viên'}</td>
                      <td className="cell-muted">{row.phone ?? row.email ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.length > PREVIEW_LIMIT && (
            <div className="cell-muted" style={{ marginTop: 6 }}>
              … và {rows.length - PREVIEW_LIMIT} dòng nữa.
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default ImportExcelModal;

const styles = {
  uploadRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  note: {
    fontSize: '0.8rem',
    color: 'var(--ink-2)',
    background: 'var(--surface-2)',
    borderRadius: 8,
    padding: '8px 12px',
    marginBottom: 12,
    lineHeight: 1.5,
  },
  summary: { fontSize: '0.85rem', color: 'var(--ink-2)', margin: '10px 0 6px' },
  errorList: { fontSize: '0.78rem', color: 'var(--red)', margin: '0 0 8px', paddingLeft: 18 },
  previewWrap: { maxHeight: 280, overflowY: 'auto' as const },
};
