import { FiAlignJustify, FiArrowDown, FiArrowUp, FiList } from 'react-icons/fi';

export type SortOrder = 'desc' | 'asc';
export type Density = 'comfortable' | 'compact';

type NoteListToolbarProps = {
  resultCount: number;
  sortOrder: SortOrder;
  density: Density;
  onSortOrderChange: (value: SortOrder) => void;
  onDensityChange: (value: Density) => void;
};

/** Thanh điều khiển sắp xếp theo ngày ghi và mật độ hiển thị danh sách. */
const NoteListToolbar = ({ resultCount, sortOrder, density, onSortOrderChange, onDensityChange }: NoteListToolbarProps) => {
  const styles = createStyles();

  return (
    <div style={styles.wrap}>
      <span className="cell-muted">{resultCount} ghi chép</span>

      <div style={styles.controls}>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => onSortOrderChange(sortOrder === 'desc' ? 'asc' : 'desc')}
          title="Sắp xếp theo ngày ghi trong bài"
        >
          {sortOrder === 'desc' ? <FiArrowDown /> : <FiArrowUp />}
          {sortOrder === 'desc' ? 'Mới nhất trước' : 'Cũ nhất trước'}
        </button>

        <div className="btn-outline" style={styles.densityGroup}>
          <button
            type="button"
            style={{ ...styles.densityBtn, ...(density === 'comfortable' ? styles.densityBtnActive : {}) }}
            onClick={() => onDensityChange('comfortable')}
            title="Hiển thị rộng rãi"
          >
            <FiAlignJustify /> Rộng rãi
          </button>
          <button
            type="button"
            style={{ ...styles.densityBtn, ...(density === 'compact' ? styles.densityBtnActive : {}) }}
            onClick={() => onDensityChange('compact')}
            title="Hiển thị gọn"
          >
            <FiList /> Gọn
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteListToolbar;

const createStyles = () => {
  return {
    wrap: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap' as const,
      gap: 10,
    },
    controls: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const },
    densityGroup: { display: 'flex', padding: 3, gap: 2, borderRadius: 999 },
    densityBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      border: 'none',
      background: 'transparent',
      color: 'var(--ink-2)',
      fontSize: '0.78rem',
      fontWeight: 700,
      padding: '5px 10px',
      borderRadius: 999,
      cursor: 'pointer',
    },
    densityBtnActive: { background: 'var(--grad-brand)', color: '#fff' },
  };
};
