import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

type NotePaginationProps = {
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

const NotePagination = ({ page, totalPages, pageSize, onPageChange, onPageSizeChange }: NotePaginationProps) => {
  const styles = createStyles();

  if (totalPages <= 1) return null;

  return (
    <div style={styles.wrap}>
      <div style={styles.pageSizeField}>
        <label className="cell-muted" htmlFor="note-page-size">Mỗi trang</label>
        <select
          id="note-page-size"
          className="select"
          style={styles.pageSizeSelect}
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      <div style={styles.nav}>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <FiChevronLeft /> Trước
        </button>
        <span className="cell-muted" style={styles.pageLabel}>Trang {page}/{totalPages}</span>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Sau <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default NotePagination;

export { PAGE_SIZE_OPTIONS };

const createStyles = () => {
  return {
    wrap: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap' as const,
      gap: 10,
    },
    pageSizeField: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem' },
    pageSizeSelect: { width: 76, padding: '6px 10px' },
    nav: { display: 'flex', alignItems: 'center', gap: 10 },
    pageLabel: { minWidth: 88, textAlign: 'center' as const },
  };
};
