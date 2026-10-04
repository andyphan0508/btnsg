/** Link ảnh Google Drive theo bề rộng mong muốn (px), WebP qua máy chủ ảnh lh3 — cùng cơ chế với landing. */
export const driveThumbnailUrl = (fileId: string, width = 400): string =>
  `https://lh3.googleusercontent.com/d/${fileId}=w${width}-rw`;
