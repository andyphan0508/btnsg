/** Link ảnh Google Drive theo bề rộng mong muốn (px) — cùng cơ chế với landing. */
export const driveThumbnailUrl = (fileId: string, width = 400): string =>
  `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
