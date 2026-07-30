import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import { FiAlertTriangle, FiBell, FiCheckCircle, FiFileText, FiImage } from 'react-icons/fi';
import {
  countSubscribers,
  fetchPushLog,
  isPushConfigured,
  sendPushMessage,
  type PushMessageLog,
  type PushSendResult,
} from '../../api/pushApi';
import LoadingState from '../../ui/LoadingState';

/** Mẫu soạn nhanh — bấm là điền sẵn, chỉ cần sửa lại chi tiết. */
const QUICK_TEMPLATES: {
  icon: IconType;
  label: string;
  title: string;
  body: string;
  url: string;
}[] = [
  {
    icon: FiBell,
    label: 'Nhắc buổi nhóm',
    title: 'Nhắc lịch sinh hoạt',
    body: 'Chúa Nhật này 14:30 có buổi nhóm thờ phượng tại Lầu 2, 161 Đề Thám. Hẹn gặp bạn!',
    url: '/sinh-hoat',
  },
  {
    icon: FiFileText,
    label: 'Có bài viết mới',
    title: 'Bài viết mới từ Ban Thanh Niên',
    body: 'Vừa có bài viết mới trên trang Tin tức — mời bạn ghé đọc.',
    url: '/tin-tuc',
  },
  {
    icon: FiImage,
    label: 'Ảnh mới',
    title: 'Ảnh hoạt động mới',
    body: 'Thư viện ảnh vừa được cập nhật những khoảnh khắc mới nhất của Ban.',
    url: '/thu-vien',
  },
];

const MAX_TITLE = 60;
const MAX_BODY = 160;
/** Gửi quá số này trong ngày thì nhắc nhẹ — người nhận dễ tắt thông báo nếu bị làm phiền. */
const DAILY_SOFT_LIMIT = 3;

const PushNotifyScreen = () => {
  // 1. State
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [url, setUrl] = useState<string>('/tin-tuc');

  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [log, setLog] = useState<PushMessageLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<PushSendResult | null>(null);

  // 2. API calls
  const loadOverview = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [count, history] = await Promise.all([countSubscribers(), fetchPushLog()]);
      setSubscriberCount(count);
      setLog(history);
    } catch {
      // Chưa chạy migration hoặc chưa cấu hình — màn hình vẫn dùng được để soạn.
      setSubscriberCount(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (): Promise<void> => {
    if (!title.trim() || !body.trim()) {
      setSendError('Vui lòng nhập tiêu đề và nội dung thông báo.');
      return;
    }
    const confirmed = window.confirm(
      `Gửi thông báo này tới ${subscriberCount ?? 'tất cả'} thiết bị đã đăng ký?\n\n${title}\n${body}`,
    );
    if (!confirmed) return;

    try {
      setIsSending(true);
      setSendError(null);
      setSendResult(null);
      const result = await sendPushMessage({ title: title.trim(), body: body.trim(), url: url.trim() });
      setSendResult(result);
      setTitle('');
      setBody('');
      await loadOverview();
    } catch (error) {
      setSendError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSending(false);
    }
  };

  // 3. Effects
  useEffect(() => {
    loadOverview();
  }, []);

  // Đếm số thông báo đã gửi trong hôm nay để nhắc tần suất.
  const todayKey = new Date().toDateString();
  const sentToday = log.filter((item) => new Date(item.createdAt).toDateString() === todayKey).length;

  // 4. Handlers
  const applyTemplate = (template: (typeof QUICK_TEMPLATES)[number]) => {
    setTitle(template.title);
    setBody(template.body);
    setUrl(template.url);
  };

  // 5. Render
  if (isLoading) return <LoadingState />;

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Liên lạc</span>
          <h2>Thông báo đẩy</h2>
          <p className="page-sub">
            Gửi thông báo tới điện thoại / máy tính của những bạn đã đồng ý nhận tin trên website.
          </p>
        </div>
      </div>

      {!isPushConfigured && (
        <div className="push-warn">
          Chưa cấu hình <code>VITE_PUSH_API_URL</code> (địa chỉ trang landing đã deploy) hoặc chưa
          bật Supabase — bạn vẫn soạn được nhưng chưa gửi thật. Xem <code>DEPLOY.md</code> Bước 4.
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Cột trái: soạn nội dung */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title">Thiết bị đang theo dõi</div>
            <div className="push-count">
              {subscriberCount === null ? '—' : subscriberCount}
              <span> thiết bị</span>
            </div>
            <div className="cell-muted">
              Con số này tăng khi có người bấm “Nhận thông báo” trên trang landing.
            </div>
            <div className="push-quota">
              Hôm nay đã gửi <strong>{sentToday}</strong> thông báo · Web Push{' '}
              <strong>không giới hạn</strong> số lần gửi.
              {sentToday >= DAILY_SOFT_LIMIT && (
                <div className="push-quota-warn">
                  <FiAlertTriangle /> Đã gửi khá nhiều trong hôm nay — gửi dày quá dễ khiến các bạn tắt thông báo.
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Soạn nhanh</div>
            <div className="push-templates">
              {QUICK_TEMPLATES.map((template) => (
                <button
                  key={template.label}
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => applyTemplate(template)}
                >
                  <template.icon /> {template.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Nội dung thông báo</div>
            <div className="form-grid">
              <div className="field span-2">
                <label className="field-label">
                  Tiêu đề * <span className="cell-muted">({title.length}/{MAX_TITLE})</span>
                </label>
                <input
                  className="input"
                  maxLength={MAX_TITLE}
                  placeholder="VD: Nhắc lịch sinh hoạt"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="field span-2">
                <label className="field-label">
                  Nội dung * <span className="cell-muted">({body.length}/{MAX_BODY})</span>
                </label>
                <textarea
                  className="textarea"
                  maxLength={MAX_BODY}
                  placeholder="Nội dung ngắn gọn hiện trên màn hình khoá của các bạn."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
              <div className="field span-2">
                <label className="field-label">Bấm vào thông báo sẽ mở trang</label>
                <select className="select" value={url} onChange={(e) => setUrl(e.target.value)}>
                  <option value="/">Trang chủ</option>
                  <option value="/tin-tuc">Tin tức</option>
                  <option value="/sinh-hoat">Lịch sinh hoạt</option>
                  <option value="/thu-vien">Thư viện ảnh</option>
                  <option value="/chu-de">Chủ đề năm</option>
                  <option value="/lien-he">Liên hệ</option>
                </select>
              </div>
            </div>

            {sendError && <div className="form-error">{sendError}</div>}
            {sendResult && (
              <div className="push-success">
                <FiCheckCircle /> Đã gửi tới <strong>{sendResult.sent}</strong>/{sendResult.total} thiết bị
                {sendResult.failed > 0 && ` · ${sendResult.failed} không nhận được`}
                {sendResult.removed ? ` · đã dọn ${sendResult.removed} thiết bị hết hạn` : ''}
                {sendResult.note && ` — ${sendResult.note}`}
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 12 }}
              disabled={isSending || !title.trim() || !body.trim()}
              onClick={handleSend}
            >
              {isSending ? 'Đang gửi…' : <><FiBell /> Gửi tới {subscriberCount ?? 'tất cả'} thiết bị</>}
            </button>
          </div>
        </div>

        {/* Cột phải: xem trước + lịch sử */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title">Xem trước trên điện thoại</div>
            <div className="push-preview">
              <div className="push-preview-app">
                <span className="push-preview-dot" />
                Ban Thanh Niên · bây giờ
              </div>
              <div className="push-preview-title">{title || 'Tiêu đề thông báo'}</div>
              <div className="push-preview-body">
                {body || 'Nội dung thông báo sẽ hiện ở đây.'}
              </div>
            </div>
            <div className="cell-muted" style={{ marginTop: 10 }}>
              Thông báo hiện trên màn hình khoá, kể cả khi các bạn không mở trang web.
            </div>
          </div>

          <div className="card">
            <div className="card-title">Đã gửi gần đây</div>
            {log.length === 0 ? (
              <div className="cell-muted">Chưa gửi thông báo nào.</div>
            ) : (
              <div className="push-log">
                {log.map((item) => (
                  <div className="push-log-item" key={item.id}>
                    <div className="push-log-head">
                      <strong>{item.title}</strong>
                      <span className="badge badge-grey">{item.sentCount} thiết bị</span>
                    </div>
                    <div className="cell-muted">{item.body}</div>
                    <div className="push-log-meta">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                      {item.sentBy && ` · ${item.sentBy}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushNotifyScreen;
