import type { OverviewStats } from '@btnsg/shared';
import { formatMoney } from '../../../utils/format';

type OverviewStatGridProps = {
  stats: OverviewStats;
};

const OverviewStatGrid = ({ stats }: OverviewStatGridProps) => {
  const styles = createStyles();

  const tiles = [
    { value: String(stats.totalMembers), label: 'Tổng ban viên', hint: `${stats.activeMembers} đang sinh hoạt` },
    { value: `${stats.attendanceRate}%`, label: 'Tỷ lệ tham gia', hint: 'Trung bình các buổi gần nhất' },
    { value: String(stats.openTasks), label: 'Công việc đang mở', hint: `${stats.doneTasks} đã hoàn thành` },
    { value: String(stats.openRequests), label: 'Request chờ xử lý', hint: 'Mới + đang xem xét' },
    { value: formatMoney(stats.balance), label: 'Số dư quỹ', hint: `Thu ${formatMoney(stats.totalIncome)}` },
  ];

  return (
    <div style={styles.grid}>
      {tiles.map((tile) => (
        <div className="card stat-tile card-hover" key={tile.label}>
          <div className="stat-tile-value">{tile.value}</div>
          <div className="stat-tile-label">{tile.label}</div>
          <div className="stat-tile-hint">{tile.hint}</div>
        </div>
      ))}
    </div>
  );
};

export default OverviewStatGrid;

const createStyles = () => {
  return {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
      gap: 16,
      marginBottom: 24,
    },
  };
};
