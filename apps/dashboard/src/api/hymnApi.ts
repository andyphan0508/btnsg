export type HymnSection = { label: string; text: string };
export type HymnInfo = { number: number; title: string; sections: HymnSection[]; order: string[] };

const cache = new Map<string, Promise<HymnInfo>>();

/** Bài Thánh Ca theo số (tên + các đoạn lời) — qua /api/hymn (Vercel Function khi deploy, API demo khi chạy local). */
export const hymnApi = {
  lookup: (number: string): Promise<HymnInfo> => {
    const key = number.replace(/^0+/, '');
    if (!cache.has(key)) {
      const request = fetch(`/api/hymn?number=${encodeURIComponent(key)}`).then(async (response) => {
        const payload = (await response.json().catch(() => null)) as (HymnInfo & { error?: string }) | null;
        if (!response.ok || !payload?.title) throw new Error(payload?.error || `Không tra được Thánh Ca ${key}`);
        return payload;
      });
      request.catch(() => cache.delete(key)); // lỗi mạng thì lần sau thử lại
      cache.set(key, request);
    }
    return cache.get(key)!;
  },
};
