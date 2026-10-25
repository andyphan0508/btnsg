import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PiArrowLeft, PiArrowRight, PiBookOpenText, PiCalendarBlank, PiMagnifyingGlass, PiMicrophone, PiX } from "react-icons/pi";
import Markdown from "../components/Markdown.jsx";
import PageHero from "../components/PageHero.jsx";
import RollText from "../components/RollText.jsx";
import { formatNewsDate } from "../lib/news.js";

// Bài giảng = mục "Bài giảng" trong Sổ ghi chép của dashboard đã bật "Công khai trên website".
async function getJson(url) {
  const response = await fetch(url);
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(data?.error || "Không tải được bài giảng.");
  return data;
}

/** Ngày · người giảng · câu gốc — dùng chung cho thẻ và trang đọc. */
function SermonMeta({ sermon, className }) {
  return (
    <div className={className}>
      {sermon.date && (
        <span className="news-date">
          <PiCalendarBlank aria-hidden="true" />
          {formatNewsDate(sermon.date)}
        </span>
      )}
      {sermon.speaker && (
        <span className="news-date">
          <PiMicrophone aria-hidden="true" />
          {sermon.speaker}
        </span>
      )}
      {sermon.scripture && (
        <span className="news-date">
          <PiBookOpenText aria-hidden="true" />
          {sermon.scripture}
        </span>
      )}
    </div>
  );
}

function SermonList() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getJson("/api/library?t=sermons")
      .then((data) => setSermons(data.sermons))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sermons;
    return sermons.filter((s) =>
      [s.title, s.speaker, s.scripture, s.excerpt, ...(s.tags || [])].join(" ").toLowerCase().includes(q),
    );
  }, [sermons, query]);

  return (
    <>
      <PageHero title="Bài giảng" lead="Lưu giữ Lời Chúa đã được chia sẻ tại Ban Thanh Niên — đọc lại, suy ngẫm và chia sẻ." />
      <main className="section section-tight">
        <div className="wrap">
          {loading && <div className="status">Đang tải bài giảng…</div>}
          {error && <div className="status is-error">{error}</div>}
          {!loading && !error && sermons.length === 0 && <div className="status">Chưa có bài giảng nào.</div>}

          {!loading && !error && sermons.length > 0 && (
            <>
              <div className="toolbar glass">
                <label className="search-box">
                  <PiMagnifyingGlass aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Tìm theo tựa đề, người giảng, câu Kinh Thánh…"
                    aria-label="Tìm bài giảng"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button type="button" onClick={() => setQuery("")} aria-label="Xóa tìm kiếm">
                      <PiX />
                    </button>
                  )}
                </label>
              </div>

              {filtered.length === 0 && <div className="status">Không có bài giảng khớp "{query}".</div>}

              <div className="news-grid">
                {filtered.map((sermon, i) => (
                  <Link
                    key={sermon.id}
                    to={`/bai-giang/${sermon.id}`}
                    className="news-card glass sfx-rise"
                    style={{ "--i": i % 3 }}
                    data-sheen
                  >
                    <div className="news-body">
                      <SermonMeta sermon={sermon} className="news-meta" />
                      <h3 className="news-title">{sermon.title}</h3>
                      {sermon.excerpt && <p className="news-desc">{sermon.excerpt}…</p>}
                      <span className="news-more">
                        <RollText text="Đọc bài giảng" />
                        <PiArrowRight aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function SermonDetail({ id }) {
  const [sermon, setSermon] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setSermon(null);
    setError(null);
    getJson(`/api/library?t=sermons&id=${encodeURIComponent(id)}`)
      .then((data) => setSermon(data.sermon))
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    if (!sermon) return undefined;
    const previous = document.title;
    document.title = `${sermon.title} — Bài giảng`;
    return () => {
      document.title = previous;
    };
  }, [sermon]);

  return (
    <main className="wrap article-page">
      {!sermon && !error && <div className="status">Đang tải bài giảng…</div>}
      {error && <div className="status is-error">{error}</div>}

      {sermon && (
        <article className="article">
          <Link to="/bai-giang" className="chip">
            <PiArrowLeft aria-hidden="true" />
            <span>Tất cả bài giảng</span>
          </Link>

          <header className="article-head">
            <SermonMeta sermon={sermon} className="article-meta" />
            <h1 className="article-title">{sermon.title}</h1>
          </header>

          <Markdown content={sermon.content} />

          <footer className="article-foot">
            <Link to="/bai-giang" className="btn btn-glass">
              <PiArrowLeft aria-hidden="true" />
              <RollText text="Xem các bài giảng khác" />
            </Link>
          </footer>
        </article>
      )}
    </main>
  );
}

export default function Sermons() {
  const { sermonId } = useParams();
  return sermonId ? <SermonDetail id={sermonId} /> : <SermonList />;
}
