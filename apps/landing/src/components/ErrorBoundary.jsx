import { Component } from "react";
import EmptyState from "./EmptyState.jsx";

/**
 * Chặn lỗi runtime cục bộ để người xem không gặp màn hình trắng khi đổi trang hoặc mạng gián đoạn.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  onReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="section wrap">
          <EmptyState
            icon="error"
            variant="error"
            eyebrow="Đã xảy ra sự cố"
            title="Không thể hiển thị nội dung này"
            description="Trang vừa gặp sự cố tạm thời. Bạn có thể tải lại trang hoặc quay về trang chủ."
            action={{ label: "Tải lại trang", onClick: this.onReload, icon: "retry" }}
            secondaryAction={{ label: "Về trang chủ", to: "/" }}
          />
        </main>
      );
    }
    return this.props.children;
  }
}
