type NewsPostFormProps = {
  title: string;
  date: string;
  description: string;
  markdown: string;
  onTitleChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onMarkdownChange: (value: string) => void;
};

/** Form nhập nội dung bài viết: tiêu đề, ngày đăng, mô tả ngắn, nội dung Markdown. */
const NewsPostForm = ({
  title,
  date,
  description,
  markdown,
  onTitleChange,
  onDateChange,
  onDescriptionChange,
  onMarkdownChange,
}: NewsPostFormProps) => {
  const styles = createStyles();

  return (
    <div className="card">
      <div className="card-title">Nội dung bài viết</div>
      <div className="form-grid">
        <div className="field span-2">
          <label className="field-label">Tiêu đề *</label>
          <input
            className="input"
            value={title}
            placeholder="VD: Trại hè Thanh Niên 2026"
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label">Ngày đăng</label>
          <input className="input" type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Mô tả ngắn (hiện ở danh sách tin)</label>
          <input
            className="input"
            value={description}
            placeholder="Bỏ trống → tự lấy đoạn văn đầu tiên"
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
        <div className="field span-2">
          <label className="field-label">Nội dung (Markdown) *</label>
          <textarea
            className="input"
            style={styles.markdownArea}
            value={markdown}
            placeholder={
              'Soạn nội dung bằng Markdown:\n\n## Tiêu đề phụ\n**đậm**, *nghiêng*, danh sách bằng dấu -\n\nChèn ảnh: bấm "Chèn vào bài" ở khu Hình ảnh.'
            }
            onChange={(e) => onMarkdownChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default NewsPostForm;

const createStyles = () => {
  return {
    markdownArea: {
      minHeight: 320,
      resize: 'vertical' as const,
      fontFamily: 'ui-monospace, Consolas, monospace',
      fontSize: '0.86rem',
      lineHeight: 1.6,
    },
  };
};
