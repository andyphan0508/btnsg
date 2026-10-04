import { Fragment } from "react";

/**
 * Cú pháp chữ chỉnh từ dashboard: *chữ* → đoạn nhấn, {anh} / {logo} → phần tử chèn giữa dòng.
 * Trả về [{ text } | { hl } | { token }] theo đúng thứ tự xuất hiện.
 */
export function parseRich(text = "") {
  return text
    .split(/(\*[^*]+\*|\{(?:anh|ảnh|logo)\})/)
    .filter(Boolean)
    .map((piece) => {
      if (/^\*[^*]+\*$/.test(piece)) return { hl: piece.slice(1, -1) };
      if (/^\{(anh|ảnh|logo)\}$/.test(piece)) return { token: piece === "{logo}" ? "logo" : "anh" };
      return { text: piece };
    });
}

/** Tiêu đề thường: đoạn nhấn → <em>, token → phần tử tương ứng trong `tokens` (thiếu thì bỏ qua). */
export function Rich({ text, tokens = {} }) {
  return parseRich(text).map((part, i) => (
    <Fragment key={i}>{part.hl ? <em>{part.hl}</em> : part.token ? tokens[part.token] ?? null : part.text}</Fragment>
  ));
}

/** Chuyển sang định dạng `parts` của ScrubText. */
export const scrubParts = (text, tokens = {}) =>
  parseRich(text).map((part) =>
    part.hl ? { hl: part.hl } : part.token ? { node: tokens[part.token] ?? null } : part.text,
  );
