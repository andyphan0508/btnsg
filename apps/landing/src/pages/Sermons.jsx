import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PiArrowLeft, PiArrowRight, PiBookOpenText, PiCalendarBlank, PiCheck, PiFacebookLogo, PiHeadphones, PiLink, PiMagnifyingGlass, PiMicrophone, PiX } from "react-icons/pi";
import { getIsoWeekInfo, getWeekKey } from "@btnsg/shared";
import Markdown from "../components/Markdown.jsx";
import PageHero from "../components/PageHero.jsx";
import RollText from "../components/RollText.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { ArticleSkeleton, SermonListSkeleton } from "../components/Skeleton.jsx";
import { formatNewsDate } from "../lib/news.js";
import { content } from "../lib/siteContent.js";

// Bài giảng = mục "Bài giảng" trong Sổ ghi chép của dashboard đã bật "Công khai trên website".
async function getJson(url) {
  const response = await fetch(url);
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(data?.error || "Không tải được bài giảng.");
  return data;
}

const YOUTUBE = /(?:youtube\.com\/(?:watch\?v=|live\/|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/;

/** Nghe bài giảng: link YouTube → nhúng trình phát; file audio (kho ảnh hoặc link MP3) → <audio>. */
function SermonPlayer({ url, title }) {
  if (!url) return null;
  const youtubeId = url.match(YOUTUBE)?.[1];
  if (youtubeId) {
    return (
      <div className="sermon-player glass">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
          title={`Video bài giảng: ${title}`}
          loading="lazy"
          allow="encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  if (!/^https:\/\//i.test(url)) return null;
  return (
    <div className="sermon-player glass">
      <p className="sermon-player-label">
        <PiHeadphones aria-hidden="true" /> Nghe bài giảng
      </p>
      <audio controls preload="metadata" src={url}>
        <a href={url}>Tải audio bài giảng</a>
      </audio>
    </div>
  );
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
      {sermon.audio_url && (
        <span className="news-date">
          <PiHeadphones aria-hidden="true" />
          Có audio
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
  const [weekFilter, setWeekFilter] = useState("");
  const [onlyAudio, setOnlyAudio] = useState(false);
  const [sortMode, setSortMode] = useState("newest");

  const loadSermons = () => {
    setLoading(true);
    setError(null);
    getJson("/api/library?t=sermons")
      .then((data) => setSermons(Array.isArray(data?.sermons) ? data.sermons : []))
      .catch((err) => setError(err.message || "Không tải được danh sách bài giảng."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSermons();
  }, []);

  const weeks = useMemo(() => {
    const map = new Map();
    for (const s of sermons) {
      const info = getIsoWeekInfo(s.date);
      if (info && !map.has(info.key)) map.set(info.key, info.label);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [sermons]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = sermons.filter((s) => {
      if (weekFilter && getWeekKey(s.date) !== weekFilter) return false;
      if (onlyAudio && !s.audio_url) return false;
      if (q && ![s.title, s.speaker, s.scripture, s.excerpt, ...(s.tags || [])].join(" ").toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
    return [...list].sort((a, b) =>
      sortMode === "oldest" ? (a.date || "").localeCompare(b.date || "") : (b.date || "").localeCompare(a.date || ""),
    );
  }, [sermons, query, weekFilter, onlyAudio, sortMode]);

  const onResetFilters = () => {
    setQuery("");
    setWeekFilter("");
    setOnlyAudio(false);
  };

  return (
    <>
      <PageHero title={content.sermonsPage.pageTitle} lead={content.sermonsPage.pageLead} />
      <main className="section section-tight">
        <div className="wrap">
          {loading && <SermonListSkeleton />}
          {!loading && error && (
            <EmptyState
              icon="error"
              variant="error"
              eyebrow="Không thể kết nối"
              title="Chưa tải được bài giảng"
              description={error}
              action={{ label: "Thử lại", onClick: loadSermons, icon: "retry" }}
              secondaryAction={{ label: "Về trang chủ", to: "/" }}
            />
          )}
          {!loading && !error && sermons.length === 0 && (
            <EmptyState
              icon="sermons"
              eyebrow="Lưu trữ Lời Chúa"
              title="Chưa có bài giảng nào được chia sẻ"
              description="Các bài giảng và bản ghi âm trong các buổi nhóm Ban Thanh Niên sẽ sớm được cập nhật tại đây."
              action={{ label: "Xem lịch sinh hoạt", to: "/sinh-hoat", icon: "arrow" }}
              secondaryAction={{ label: "Xem chủ đề năm", to: "/chu-de" }}
            />
          )}

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

                {weeks.length > 0 && (
                  <select
                    className="gallery-select"
                    aria-label="Lọc bài giảng theo tuần"
                    value={weekFilter}
                    onChange={(e) => setWeekFilter(e.target.value)}
                  >
                    <option value="">Mọi tuần</option>
                    {weeks.map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  className="gallery-select"
                  aria-label="Sắp xếp bài giảng"
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value)}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                </select>

                <button
                  type="button"
                  className={`chip${onlyAudio ? " is-active" : ""}`}
                  aria-pressed={onlyAudio}
                  onClick={() => setOnlyAudio((v) => !v)}
                >
                  <PiHeadphones aria-hidden="true" />
                  <span>Có audio</span>
                </button>
              </div>

              {filtered.length === 0 ? (
                <EmptyState
                  icon="search"
                  variant="search"
                  compact
                  title="Không tìm thấy bài giảng phù hợp"
                  description={
                    query.trim()
                      ? `Không có bài giảng nào khớp với từ khóa "${query.trim()}".`
                      : "Không có bài giảng nào khớp với bộ lọc hiện tại."
                  }
                  action={{ label: "Xóa bộ lọc", onClick: onResetFilters }}
                />
              ) : (
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
                        {sermon.excerpt && (
                          <p className="news-desc">
                            {sermon.excerpt.length >= 195 ? `${sermon.excerpt}…` : sermon.excerpt}
                          </p>
                        )}
                        <span className="news-more">
                          <RollText text="Đọc bài giảng" />
                          <PiArrowRight aria-hidden="true" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
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
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const fbShareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const loadSermon = () => {
    setSermon(null);
    setError(null);
    getJson(`/api/library?t=sermons&id=${encodeURIComponent(id)}`)
      .then((data) => {
        if (!data?.sermon) throw new Error("Không tìm thấy bài giảng.");
        setSermon(data.sermon);
      })
      .catch((err) => setError(err.message || "Không tải được bài giảng."));
  };

  useEffect(() => {
    loadSermon();
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
      {!sermon && !error && <ArticleSkeleton />}
      {error && (
        <EmptyState
          icon="error"
          variant="error"
          eyebrow="Không tìm thấy bài giảng"
          title="Chưa thể mở bài giảng này"
          description={error}
          action={{ label: "Tất cả bài giảng", to: "/bai-giang", icon: "back" }}
          secondaryAction={{ label: "Thử lại", onClick: loadSermon, icon: "retry" }}
        />
      )}

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

          <SermonPlayer url={sermon.audio_url} title={sermon.title} />

          <Markdown content={sermon.content} />

          <footer className="article-foot">
            <Link to="/bai-giang" className="btn btn-glass">
              <PiArrowLeft aria-hidden="true" />
              <RollText text="Xem các bài giảng khác" />
            </Link>
            <div className="article-share">
              <a
                className="btn btn-sun"
                href={fbShareHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PiFacebookLogo aria-hidden="true" />
                <RollText text="Chia sẻ Facebook" />
              </a>
              <button type="button" className="btn btn-glass" onClick={onCopyLink}>
                {copied ? <PiCheck aria-hidden="true" /> : <PiLink aria-hidden="true" />}
                <span>{copied ? "Đã sao chép" : "Sao chép link"}</span>
              </button>
            </div>
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
