type LoadingStateProps = {
  label?: string;
};

const LoadingState = ({ label = 'Đang tải dữ liệu…' }: LoadingStateProps) => {
  return (
    <div className="loading-state">
      <div className="spinner" />
      {label}
    </div>
  );
};

export default LoadingState;
