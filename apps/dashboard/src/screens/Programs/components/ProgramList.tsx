import type { Program } from '@btnsg/shared';
import { nextSunday, todayInVietnam } from '@btnsg/shared';
import { FiMusic } from 'react-icons/fi';
import EmptyState from '../../../ui/EmptyState';
import { formatDate } from '../../../utils/format';

type ProgramListProps = {
  programs: Program[];
  onEdit: (program: Program) => void;
  onCopy: (program: Program) => void;
};

const ProgramList = ({ programs, onEdit, onCopy }: ProgramListProps) => {
  if (programs.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={<FiMusic />}
          title="Chưa có chương trình"
          hint="Bấm “Chương trình mới” để bắt đầu từ sườn mẫu: Chào mừng → Cầu nguyện → Câu gốc → Khẩu hiệu → Tôn vinh."
        />
      </div>
    );
  }

  const today = todayInVietnam();
  const thisSunday = nextSunday(today);

  return (
    <div className="card table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Chương trình</th>
            <th>Trạng thái</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {programs.map((program) => {
            const songs = program.items.map((item) => item.song?.title).filter(Boolean);
            const minutes = program.items.reduce((sum, item) => sum + (item.minutes ?? 0), 0);
            return (
              <tr key={program.id} onClick={() => onEdit(program)} style={{ cursor: 'pointer' }}>
                <td>
                  <div className="cell-strong">{formatDate(program.date)}</div>
                  {program.date === thisSunday && <div className="cell-muted">Chúa Nhật này</div>}
                  {(program.startTime || minutes > 0) && (
                    <div className="cell-muted">{[program.startTime, minutes > 0 && `${minutes} phút`].filter(Boolean).join(' · ')}</div>
                  )}
                </td>
                <td>
                  <div className="cell-strong">{program.title || `${program.items.length} mục`}</div>
                  {songs.length > 0 && <div className="cell-muted">{songs.join(' · ')}</div>}
                </td>
                <td>
                  <span className={`badge ${program.published ? 'badge-green' : 'badge-grey'}`}>
                    {program.published ? 'Đã công bố' : 'Bản nháp'}
                  </span>
                  {program.date < today && <span className="badge badge-grey" style={{ marginLeft: 6 }}>Đã qua</span>}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopy(program);
                    }}
                  >
                    Sao chép
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProgramList;
