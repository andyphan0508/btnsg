import { useEffect, useState } from 'react';
import { FiAlertTriangle, FiCopy, FiExternalLink, FiShare2 } from 'react-icons/fi';
import { stripHtmlToText } from '@btnsg/shared';
import { LANDING_URL } from '../api/siteContentApi';
import { useDialog } from './DialogProvider';
import Modal from './Modal';

export const PUBLIC_LANDING_URL = (LANDING_URL || 'https://btnsg-landing.pages.dev').replace(/\/$/, '');
const FANPAGE_URL = 'https://www.facebook.com/banthanhnienhttlsaigon';

type FacebookShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  description?: string;
  coverUrl?: string;
  isDraft?: boolean;
};

const getHost = (url: string) => {
  try {
    return new URL(url).hostname.toUpperCase();
  } catch {
    return 'BTNSG-LANDING.PAGES.DEV';
  }
};

const FacebookShareModal = ({
  isOpen,
  onClose,
  url,
  title,
  description = '',
  coverUrl = '',
  isDraft = false,
}: FacebookShareModalProps) => {
  const { notify } = useDialog();
  const cleanDesc = stripHtmlToText(description).slice(0, 200);
  const [caption, setCaption] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    const parts = [
      title.trim(),
      cleanDesc,
      `Đọc chi tiết tại: ${url}`,
      '#BanThanhNienSaiGon #HTTLSaiGon',
    ].filter(Boolean);
    setCaption(parts.join('\n\n'));
  }, [isOpen, title, cleanDesc, url]);

  const openFacebookSharer = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(
      caption,
    )}`;
    const width = 640;
    const height = 680;
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
    window.open(shareUrl, 'fb-share-dialog', `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`);
  };

  const copyCaptionAndOpenFanpage = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      notify('Đã sao chép nội dung bài đăng — bạn chỉ cần dán lên Fanpage.');
    } catch {
      notify('Không sao chép tự động được, hãy copy thủ công ở ô bên trên.', 'error');
    }
    window.open(FANPAGE_URL, '_blank', 'noopener,noreferrer');
  };

  const copyLinkOnly = async () => {
    try {
      await navigator.clipboard.writeText(url);
      notify('Đã sao chép đường dẫn bài viết.');
    } catch {
      notify('Không sao chép được đường dẫn.', 'error');
    }
  };

  return (
    <Modal
      size="md"
      isOpen={isOpen}
      title="Chia sẻ bài viết lên Facebook"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={copyLinkOnly}>
            <FiCopy /> Sao chép link
          </button>
          <button type="button" className="btn btn-outline" onClick={copyCaptionAndOpenFanpage}>
            <FiExternalLink /> Copy & mở Fanpage
          </button>
          <button type="button" className="btn btn-primary" onClick={openFacebookSharer}>
            <FiShare2 /> Chia sẻ lên Facebook
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {isDraft && (
          <div className="fb-draft-warn">
            <FiAlertTriangle />
            <span>
              Bài viết đang ở trạng thái <strong>Bản nháp</strong> — hãy chuyển sang <strong>Công khai</strong> trước
              khi chia sẻ để Facebook đọc được tiêu đề và ảnh bìa.
            </span>
          </div>
        )}

        <div>
          <div className="field-label" style={{ marginBottom: 6 }}>
            Xem trước thẻ bài viết trên Facebook
          </div>
          <div className="fb-preview-card">
            {coverUrl && (
              <div className="fb-preview-cover">
                <img src={coverUrl} alt={title} />
              </div>
            )}
            <div className="fb-preview-meta">
              <div className="fb-preview-domain">{getHost(url)}</div>
              <div className="fb-preview-title">{title || '(Chưa có tiêu đề)'}</div>
              {cleanDesc && <div className="fb-preview-desc">{cleanDesc}</div>}
            </div>
          </div>
        </div>

        <div className="field" style={{ margin: 0 }}>
          <label className="field-label">Lời dẫn khi đăng Facebook / Fanpage (chỉnh sửa tự do)</label>
          <textarea
            className="textarea"
            rows={5}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <span className="cell-muted" style={{ fontSize: '0.76rem' }}>
            Link chia sẻ: <code>{url}</code>
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default FacebookShareModal;
