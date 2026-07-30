import type { ScheduleEvent } from '@btnsg/shared';
import { DAY_OF_WEEK_LABELS } from '@btnsg/shared';
import EmptyState from '../../../ui/EmptyState';
import { formatDate } from '../../../utils/format';
import { FiCalendar } from 'react-icons/fi';

type ScheduleTableProps = {
  events: ScheduleEvent[];
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (event: ScheduleEvent) => void;
};

const ScheduleTable = ({ events, onEdit, onDelete }: ScheduleTableProps) => {
  if (events.length === 0) {
    return (
      <div className="table-wrap">
        <EmptyState icon={<FiCalendar />} title="Chưa có lịch sinh hoạt" hint="Thêm buổi sinh hoạt định kỳ hoặc sự kiện." />
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Buổi sinh hoạt</th>
            <th>Địa điểm</th>
            <th>Ghi chú</th>
            <th style={{ textAlign: 'right' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td data-label="Thời gian">
                <span className={`badge ${event.isMain ? 'badge-brand' : 'badge-grey'}`}>
                  {event.recurrence === 'weekly' && event.dayOfWeek !== undefined
                    ? `${DAY_OF_WEEK_LABELS[event.dayOfWeek]} hằng tuần`
                    : formatDate(event.date)}
                </span>
                <div className="cell-strong" style={{ marginTop: 4 }}>{event.time}</div>
              </td>
              <td data-label="Buổi sinh hoạt">
                <span className="cell-strong">{event.title}</span>
                {event.isMain && <div className="cell-muted">Buổi nhóm chính</div>}
              </td>
              <td data-label="Địa điểm" className="cell-muted">{event.location ?? '—'}</td>
              <td data-label="Ghi chú" className="cell-muted">{event.description ?? '—'}</td>
              <td>
                <div className="cell-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => onEdit(event)}>Sửa</button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(event)}>Xoá</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;
