import type { NewsPostMeta } from '../../../api/newsApi';

type NewsPostListProps = {
  posts: NewsPostMeta[];
  isLoading: boolean;
  error: string | null;
  editingPostId: string | null;
  deletingPostId: string | null;
  onEdit: (post: NewsPostMeta) => void;
  onDelete: (post: NewsPostMeta) => void;
};

const formatDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
};

const NewsPostList = ({
  posts,
  isLoading,
  error,
  editingPostId,
  deletingPostId,
  onEdit,
  onDelete,
}: NewsPostListProps) => {
  const styles = createStyles();

  return (
    <div className="card">
      <div className="card-title">Bài đã đăng ({posts.length})</div>
      {isLoading && <div className="cell-muted">Đang tải danh sách bài…</div>}
      {error && <div className="form-error">{error}</div>}
      {!isLoading && !error && posts.length === 0 && (
        <div className="cell-muted">Chưa có bài viết nào trên Google Drive.</div>
      )}
      <div style={styles.list}>
        {posts.map((post) => (
          <div
            key={post.id}
            style={{ ...styles.item, ...(post.id === editingPostId ? styles.itemActive : {}) }}
          >
            <div style={styles.itemInfo}>
              <div className="cell-strong">{post.title}</div>
              <div className="cell-muted">
                {formatDate(post.date)}
                {post.description ? ` — ${post.description}` : ''}
              </div>
            </div>
            <div style={styles.itemActions}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(post)}>
                Sửa
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={deletingPostId === post.id}
                onClick={() => onDelete(post)}
              >
                {deletingPostId === post.id ? 'Đang xoá…' : 'Xoá'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsPostList;

const createStyles = () => {
  return {
    list: { display: 'flex', flexDirection: 'column' as const, gap: 8 },
    item: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      padding: '10px 12px',
      borderRadius: 10,
      border: '1px solid var(--line, #e5decf)',
    },
    itemActive: {
      border: '1px solid var(--brand)',
      background: 'var(--brand-soft)',
    },
    itemInfo: { minWidth: 0 },
    itemActions: { display: 'flex', gap: 4, flexShrink: 0 },
  };
};
