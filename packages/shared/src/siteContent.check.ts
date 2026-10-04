// Tự kiểm tra chuẩn hoá nội dung landing: npx tsx packages/shared/src/siteContent.check.ts
import assert from 'node:assert/strict';
import { mergeSiteContent, SITE_SECTIONS, toSiteImageUrl } from './siteContent';

const defaults = mergeSiteContent(null);
for (const section of SITE_SECTIONS) assert.deepEqual(defaults[section.key], section.defaults, `mặc định ${section.key}`);

// Ghép lại lần nữa không đổi gì (kể cả thứ tự key) — dashboard dựa vào đây để biết mục nào chưa lưu.
assert.equal(JSON.stringify(mergeSiteContent(defaults)), JSON.stringify(defaults), 'ghép lặp phải giữ nguyên');

const merged = mergeSiteContent({
  general: { brand: 'BTN', facebook: 'javascript:alert(1)' }, // ô thiếu → mặc định, link độc → rỗng
  board: [{ name: 'A', duties: 'x\n\n y ' }, 'rác'], // chuỗi nhiều dòng → mảng; mục sai kiểu → mục trống
  links: { not: 'a list' }, // danh sách sai kiểu → mặc định
  stats: [], // xoá hết là hợp lệ
});
const general = merged.general as Record<string, unknown>;
assert.equal(general.brand, 'BTN');
assert.equal(general.facebook, '');
assert.equal(general.mission, 'TẤT CẢ VÌ NGƯỜI CHƯA ĐƯỢC CỨU');
assert.deepEqual(merged.board, [
  { name: 'A', role: '', duties: ['x', 'y'] },
  { name: '', role: '', duties: [] },
]);
assert.deepEqual(merged.links, SITE_SECTIONS.find((s) => s.key === 'links')!.defaults);
assert.deepEqual(merged.stats, []);

const id = '1AbCdEfGhIjKlMnOpQrStUvWxYz012345';
assert.equal(toSiteImageUrl(`https://drive.google.com/file/d/${id}/view?usp=sharing`, 800), `https://drive.google.com/thumbnail?id=${id}&sz=w800`);
assert.equal(toSiteImageUrl(id, 800), `https://drive.google.com/thumbnail?id=${id}&sz=w800`);
assert.equal(toSiteImageUrl('https://example.com/a.jpg'), 'https://example.com/a.jpg');
assert.equal(toSiteImageUrl('javascript:alert(1)'), '');
assert.equal(toSiteImageUrl('http://insecure.example/a.jpg'), '');

console.log('siteContent: OK');
