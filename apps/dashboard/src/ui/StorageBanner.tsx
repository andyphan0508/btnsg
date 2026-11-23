import { useEffect, useState } from 'react';
import { fetchStorageUsage, type StorageUsage } from '../lib/images';
import { formatBytes } from '../utils/imageCompress';

/**
 * Cảnh báo dung lượng kho ảnh R2 (soft limit): từ 80% hiện vàng, từ 95% hiện đỏ — lúc đó Worker
 * đã ngừng nhận ảnh mới để không phát sinh phí. Chưa dùng R2 thì không hiện gì.
 */
const StorageBanner = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const [usage, setUsage] = useState<StorageUsage | null>(null);

  useEffect(() => {
    fetchStorageUsage().then(setUsage);
  }, [refreshKey]);

  if (!usage) return null;
  const percent = Math.round((usage.bytes / usage.limitBytes) * 100);
  const blocked = usage.bytes >= usage.blockBytes || usage.writes >= usage.writeBlock;
  const warning = blocked || usage.bytes >= usage.warnBytes;

  const style = blocked ? styles.blocked : warning ? styles.warning : styles.normal;
  return (
    <div style={{ ...styles.box, ...style }} role={warning ? 'alert' : undefined}>
      <progress max={100} value={Math.min(percent, 100)} style={styles.bar} />
      <span>
        Kho ảnh R2: {formatBytes(usage.bytes)} / {formatBytes(usage.limitBytes)} miễn phí ({percent}%)
        {blocked && ' — đã tạm ngừng nhận ảnh mới để không phát sinh phí. Hãy xoá bớt ảnh cũ.'}
        {!blocked && warning && ' — sắp đầy, nên xoá bớt ảnh cũ.'}
      </span>
    </div>
  );
};

export default StorageBanner;

const styles = {
  box: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: '0.85rem',
    marginBottom: 16,
  },
  bar: { width: 120, height: 8, flex: 'none' },
  normal: { background: 'var(--surface-2)' },
  warning: { background: 'rgba(240, 193, 75, 0.18)', color: '#9a7415' },
  blocked: { background: 'rgba(239, 68, 68, 0.14)', color: '#b42318' },
};
