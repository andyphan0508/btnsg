import { useEffect, useRef, useState } from 'react';
import type { SiteContent } from '@btnsg/shared';
import { LANDING_URL } from '../../../api/siteContentApi';

type PreviewFrameProps = {
  /** Trang landing đang xem trước, vd "/gioi-thieu". */
  path: string;
  content: SiteContent;
};

const LANDING_ORIGIN = LANDING_URL ? new URL(LANDING_URL).origin : '';
/** Chờ bấy nhiêu ms mà landing chưa bắt tay → hiện hướng dẫn cấu hình. */
const HANDSHAKE_TIMEOUT_MS = 6000;

/**
 * Landing thật trong iframe (?preview=1). Landing báo "btnsg:ready" → gửi bản nháp qua postMessage;
 * mỗi lần sửa gửi lại (gộp các phím gõ liên tiếp). Chỉ trao đổi đúng origin hai bên.
 */
const PreviewFrame = ({ path, content }: PreviewFrameProps) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const contentRef = useRef(content);
  contentRef.current = content;
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isSlow, setIsSlow] = useState<boolean>(false);

  const postDraft = () => {
    frameRef.current?.contentWindow?.postMessage({ type: 'btnsg:preview', content: contentRef.current }, LANDING_ORIGIN);
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== LANDING_ORIGIN || event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type !== 'btnsg:ready') return;
      setIsReady(true);
      postDraft();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    setIsReady(false);
    setIsSlow(false);
    const timer = setTimeout(() => setIsSlow(true), HANDSHAKE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [path]);

  useEffect(() => {
    if (!isReady) return;
    const timer = setTimeout(postDraft, 250);
    return () => clearTimeout(timer);
  }, [content, isReady]);

  if (!LANDING_URL) {
    return (
      <div className="card website-preview">
        <p className="website-hint">
          Chưa cấu hình <code>VITE_LANDING_URL</code> (địa chỉ trang landing) nên chưa xem trước được.
        </p>
      </div>
    );
  }

  return (
    <div className="card website-preview">
      <div className="website-preview-head">
        <span>
          Xem trước <code>{path}</code> {isReady && <span className="badge badge-green">Trực tiếp</span>}
        </span>
        <a className="btn btn-ghost btn-sm" href={`${LANDING_URL}${path}`} target="_blank" rel="noopener noreferrer">
          Mở trang thật ↗
        </a>
      </div>
      <iframe ref={frameRef} key={path} title="Xem trước trang landing" src={`${LANDING_URL}${path}?preview=1`} />
      {!isReady && isSlow && (
        <p className="website-hint">
          Khung chưa nhận bản nháp. Kiểm tra trên project landing: biến <code>VITE_ADMIN_ORIGIN</code> phải là{' '}
          <code>{window.location.origin}</code> và landing đã được deploy bản mới.
        </p>
      )}
    </div>
  );
};

export default PreviewFrame;
