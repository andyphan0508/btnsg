/** Tên bài Thánh Ca theo số — qua /api/hymn (Vercel Function khi deploy, API demo khi chạy local). */
export const hymnApi = {
  lookupTitle: async (number: string): Promise<string> => {
    const response = await fetch(`/api/hymn?number=${encodeURIComponent(number)}`);
    const payload = (await response.json().catch(() => null)) as { title?: string; error?: string } | null;
    if (!response.ok || !payload?.title) throw new Error(payload?.error || `Không tra được Thánh Ca ${number}`);
    return payload.title;
  },
};
