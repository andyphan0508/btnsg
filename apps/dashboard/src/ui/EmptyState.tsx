type EmptyStateProps = {
  icon?: string;
  title: string;
  hint?: string;
};

const EmptyState = ({ icon = '🗂️', title, hint }: EmptyStateProps) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <b>{title}</b>
      {hint && <span>{hint}</span>}
    </div>
  );
};

export default EmptyState;
