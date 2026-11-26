import { Link } from "react-router-dom";
import {
  PiArrowClockwise,
  PiArrowLeft,
  PiArrowRight,
  PiBookOpenText,
  PiCompass,
  PiImages,
  PiMagnifyingGlass,
  PiNewspaper,
  PiSparkle,
  PiWarningCircle,
} from "react-icons/pi";
import RollText from "./RollText.jsx";

const PRESET_ICONS = {
  gallery: PiImages,
  news: PiNewspaper,
  sermons: PiBookOpenText,
  search: PiMagnifyingGlass,
  error: PiWarningCircle,
  notFound: PiCompass,
  default: PiSparkle,
};

/**
 * Thẻ hiển thị trạng thái trống / chưa có dữ liệu / không tìm thấy / lỗi tải.
 * Thiết kế đồng bộ kính mờ "Ánh sáng xuyên kính" (cả chế độ tối & sáng).
 */
const EmptyState = ({
  icon = "default",
  eyebrow,
  title,
  description,
  variant = "empty", // "empty" | "search" | "error"
  compact = false,
  action, // { label, to?, onClick?, icon?: "retry" | "back" | "arrow" }
  secondaryAction, // { label, to?, onClick? }
}) => {
  const Icon = typeof icon === "string" ? PRESET_ICONS[icon] || PRESET_ICONS.default : icon;

  const renderAction = (item, isPrimary) => {
    if (!item) return null;
    const className = isPrimary ? "btn btn-sun btn-sm" : "btn btn-glass btn-sm";
    const leadingIcon =
      item.icon === "retry" ? (
        <PiArrowClockwise aria-hidden="true" />
      ) : item.icon === "back" ? (
        <PiArrowLeft aria-hidden="true" />
      ) : null;
    const trailingIcon =
      item.icon === "arrow" ? (
        <span className="btn-icon">
          <PiArrowRight aria-hidden="true" />
        </span>
      ) : null;

    const inner = (
      <>
        {leadingIcon}
        <RollText text={item.label} />
        {trailingIcon}
      </>
    );

    if (item.to) {
      return (
        <Link to={item.to} className={className}>
          {inner}
        </Link>
      );
    }
    return (
      <button type="button" className={className} onClick={item.onClick}>
        {inner}
      </button>
    );
  };

  return (
    <div
      className={`empty-state glass${variant === "error" ? " is-error" : ""}${compact ? " is-compact" : ""}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <span className="empty-state-glow" aria-hidden="true" />
      <span className="empty-state-icon" aria-hidden="true">
        <Icon />
      </span>
      {eyebrow && <span className="empty-state-eyebrow">{eyebrow}</span>}
      {title && <h3 className="empty-state-title">{title}</h3>}
      {description && <p className="empty-state-desc">{description}</p>}
      {(action || secondaryAction) && (
        <div className="empty-state-actions">
          {renderAction(action, true)}
          {renderAction(secondaryAction, false)}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
