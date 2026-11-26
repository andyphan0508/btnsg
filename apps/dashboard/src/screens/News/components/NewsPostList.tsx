import { useMemo, useState } from 'react';
import { FiEdit2, FiExternalLink, FiFileText, FiSearch, FiShare2, FiTrash2 } from 'react-icons/fi';
import type { NewsPostMeta } from '../../../api/newsApi';
import { PUBLIC_LANDING_URL } from '../../../ui/FacebookShareModal';
import EmptyState from '../../../ui/EmptyState';
import LoadingState from '../../../ui/LoadingState';

type NewsPostListProps = {
  posts: NewsPostMeta[];
  isLoading: boolean;
  error: string | null;
  editingPostId: string | null;
  deletingPostId: string | null;
  onEdit: (post: NewsPostMeta) => void;
  onDelete: (post: NewsPostMeta) => void;
  onShare: (post: NewsPostMeta) => void;
};

const formatDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate || 'Chưa đặt ngày';
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
  onShare,
}: NewsPostListProps) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      if (statusFilter === 'published' && !post.published) return false;
      if (statusFilter === 'draft' && post.published) return false;
      if (q) {
        const hay = `${post.title} ${post.description} ${post.date}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [posts, searchQuery, statusFilter]);

  const publishedCount = useMemo(() => posts.filter((p) => p.published).length, [posts]);
  const draftCount = posts.length - publishedCount;

  return (
    <div className="card">
      <div className="wp-list-head">
        <div>
          <div className="card-title" style={{ margin: 0 }}>
            Tất cả bài viết ({posts.length})
          </div>
          <span className="cell-muted" style={{ fontSize: '0.8rem' }}>
            {publishedCount} công khai · {draftCount} bản nháp
          </span>
        </div>

        <div className="segmented" role="group" aria-label="Lọc trạng thái bài viết">
          <button
            type="button"
            className={statusFilter === 'all' ? 'active' : undefined}
            onClick={() => setStatusFilter('all')}
          >
            Tất cả ({posts.length})
          </button>
          <button
            type="button"
            className={statusFilter === 'published' ? 'active' : undefined}
            onClick={() => setStatusFilter('published')}
          >
            Công khai ({publishedCount})
          </button>
          <button
            type="button"
            className={statusFilter === 'draft' ? 'active' : undefined}
            onClick={() => setStatusFilter('draft')}
          >
            Bản nháp ({draftCount})
          </button>
        </div>
      </div>

      <div className="toolbar" style={{ marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <FiSearch
            style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}
          />
          <input
            className="input"
            style={{ paddingLeft: 34 }}
            value={searchQuery}
            placeholder="Tìm bài viết theo tiêu đề, mô tả…"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <LoadingState label="Đang tải danh sách bài viết…" />}
      {error && <div className="form-error">{error}</div>}
      {!isLoading && !error && filteredPosts.length === 0 && (
        <EmptyState
          icon={<FiFileText />}
          title={posts.length === 0 ? 'Chưa có bài viết nào' : 'Không tìm thấy bài viết phù hợp'}
          hint={posts.length === 0 ? 'Bấm "+ Viết bài mới" ở góc trên để soạn bài đầu tiên.' : 'Thử từ khóa khác hoặc đổi bộ lọc.'}
        />
      )}

      {!isLoading && !error && filteredPosts.length > 0 && (
        <div className="wp-post-list">
          {filteredPosts.map((post) => {
            const publicUrl = `${PUBLIC_LANDING_URL}/tin-tuc/${post.id}`;
            return (
              <div
                key={post.id}
                className={`wp-post-row${post.id === editingPostId ? ' is-active' : ''}`}
              >
                <div className="wp-post-thumb">
                  {post.cover ? (
                    <img src={post.cover} alt={post.title} loading="lazy" />
                  ) : (
                    <FiFileText />
                  )}
                </div>

                <div className="wp-post-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="wp-post-title-btn"
                      onClick={() => onEdit(post)}
                    >
                      {post.title}
                    </button>
                    <span className={`badge ${post.published ? 'badge-green' : 'badge-grey'}`}>
                      {post.published ? 'Công khai' : 'Bản nháp'}
                    </span>
                  </div>
                  <div className="cell-muted" style={{ fontSize: '0.82rem', marginTop: 2 }}>
                    {formatDate(post.date)}
                    {post.description ? ` — ${post.description}` : ''}
                  </div>
                </div>

                <div className="wp-post-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => onEdit(post)}>
                    <FiEdit2 /> Sửa
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => onShare(post)}>
                    <FiShare2 /> Facebook
                  </button>
                  {post.published && (
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                      title="Mở bài viết trên web"
                    >
                      <FiExternalLink />
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    aria-label="Xóa bài viết"
                    disabled={deletingPostId === post.id}
                    onClick={() => onDelete(post)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NewsPostList;
