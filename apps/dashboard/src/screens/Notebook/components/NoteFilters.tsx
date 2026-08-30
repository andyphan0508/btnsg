import { NOTE_CATEGORY_LABELS, type NoteCategory } from '@btnsg/shared';
import { FiSearch } from 'react-icons/fi';

type NoteFiltersProps = {
  searchQuery: string;
  categoryFilter: NoteCategory | 'all';
  activeTag: string | null;
  allTags: string[];
  onSearchQueryChange: (value: string) => void;
  onCategoryFilterChange: (value: NoteCategory | 'all') => void;
  onTagClick: (tag: string) => void;
};

/** Bộ lọc để tra cứu / đối chiếu: tìm theo từ khoá, lọc theo loại và theo thẻ. */
const NoteFilters = ({
  searchQuery,
  categoryFilter,
  activeTag,
  allTags,
  onSearchQueryChange,
  onCategoryFilterChange,
  onTagClick,
}: NoteFiltersProps) => {
  const styles = createStyles();

  return (
    <div className="card">
      <div className="card-title">Tìm & đối chiếu</div>
      <div style={styles.searchRow}>
        <FiSearch style={styles.searchIcon} />
        <input
          className="input"
          style={styles.searchInput}
          value={searchQuery}
          placeholder="Tìm theo tiêu đề, nội dung, câu gốc, người chia sẻ, thẻ…"
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
      </div>
      <div style={styles.categoryRow}>
        <button
          type="button"
          className={`btn btn-sm ${categoryFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => onCategoryFilterChange('all')}
        >
          Tất cả
        </button>
        {(Object.entries(NOTE_CATEGORY_LABELS) as [NoteCategory, string][]).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`btn btn-sm ${categoryFilter === value ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => onCategoryFilterChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {allTags.length > 0 && (
        <div style={styles.tagRow}>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`badge ${activeTag === tag ? 'badge-brand' : 'badge-grey'}`}
              style={styles.tagBtn}
              onClick={() => onTagClick(tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteFilters;

const createStyles = () => {
  return {
    searchRow: { position: 'relative' as const, marginBottom: 10 },
    searchIcon: {
      position: 'absolute' as const,
      left: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--ink-3, #98897b)',
    },
    searchInput: { paddingLeft: 34 },
    categoryRow: { display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: 10 },
    tagRow: { display: 'flex', flexWrap: 'wrap' as const, gap: 6 },
    tagBtn: { cursor: 'pointer', border: 'none' },
  };
};
