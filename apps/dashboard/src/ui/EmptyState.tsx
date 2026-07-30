import type { ReactNode } from 'react';
import { FiInbox } from 'react-icons/fi';

type EmptyStateProps = {
  /** Icon vector (react-icons). Bỏ trống dùng icon hộp rỗng mặc định. */
  icon?: ReactNode;
  title: string;
  hint?: string;
};

const EmptyState = ({ icon, title, hint }: EmptyStateProps) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon ?? <FiInbox />}</div>
      <b>{title}</b>
      {hint && <span>{hint}</span>}
    </div>
  );
};

export default EmptyState;
