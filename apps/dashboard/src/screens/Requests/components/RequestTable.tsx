import type { RequestItem, RequestStatus } from '@btnsg/shared';
import { REQUEST_STATUS_LABELS } from '@btnsg/shared';
import EmptyState from '../../../ui/EmptyState';
import { formatDate } from '../../../utils/format';

type RequestTableProps = {
  requests: RequestItem[];
  onEdit: (item: RequestItem) => void;
  onDelete: (item: RequestItem) => void;
  onSetStatus: (item: RequestItem, status: RequestStatus) => void;
};

const STATUS_BADGE: Record<RequestStatus, string> = {
  open: 'badge-blue',
  in_review: 'badge-amber',
  approved: 'badge-green',
  rejected: 'badge-red',
  done: 'badge-grey',
};

const RequestTable = ({ requests, onEdit, onDelete, onSetStatus }: RequestTableProps) => {
  if (requests.length === 0) {
    return (
      <div className="table-wrap">
        <EmptyState
          icon="📮"
          title="Chưa có request nào"
          hint="Ghi nhận mọi đề xuất, yêu cầu để không bị miss thông tin."
        />
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Đề xuất</th>
            <th>Người gửi</th>
            <th>Ngày gửi</th>
            <th>Trạng thái</th>
            <th>Phản hồi</th>
            <th style={{ textAlign: 'right' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((item) => (
            <tr key={item.id}>
              <td>
                <span className="cell-strong">{item.title}</span>
                <div className="cell-muted">{item.content}</div>
              </td>
              <td>{item.requesterName}</td>
              <td className="cell-muted">{formatDate(item.createdAt)}</td>
              <td>
                <select
                  className="select"
                  style={{ minWidth: 130, padding: '6px 10px' }}
                  value={item.status}
                  onChange={(e) => onSetStatus(item, e.target.value as RequestStatus)}
                >
                  {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <div style={{ marginTop: 6 }}>
                  <span className={`badge ${STATUS_BADGE[item.status]}`}>{REQUEST_STATUS_LABELS[item.status]}</span>
                </div>
              </td>
              <td className="cell-muted">{item.response ?? '—'}</td>
              <td>
                <div className="cell-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => onEdit(item)}>Sửa</button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(item)}>Xoá</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestTable;
