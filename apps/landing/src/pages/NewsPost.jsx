import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  LeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import Markdown from "../components/Markdown.jsx";
import { driveImage } from "../lib/gallery.js";
import {
  fetchPost,
  formatNewsDate,
  readNewsCache,
  subscribeWindowFocus,
} from "../lib/news.js";

const estimateReadMinutes = (content) => {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
};

export default function NewsPost() {
  const { postId } = useParams();
  const [post, setPost] = useState(() => readNewsCache(`post:${postId}`));
  const [isLoadingPost, setIsLoadingPost] = useState(!post);
  const [postError, setPostError] = useState(null);

  const loadPost = async (silent) => {
    try {
      const data = await fetchPost(postId);
      setPost(data);
      setPostError(null);
    } catch (error) {
      if (!silent) setPostError(error.message || "Không tải được bài viết.");
    } finally {
      setIsLoadingPost(false);
    }
  };

  useEffect(() => {
    const cachedPost = readNewsCache(`post:${postId}`);
    setPost(cachedPost);
    setIsLoadingPost(!cachedPost);
    setPostError(null);
    loadPost(Boolean(cachedPost));
    return subscribeWindowFocus(() => loadPost(true));
  }, [postId]);

  const imageMap = {};
  for (const image of post?.images || []) {
    const name = image.name.normalize("NFC").toLowerCase();
    imageMap[name] = image.id;
    imageMap[name.replace(/\.[a-z0-9]+$/i, "")] = image.id;
  }

  return (
    <main className="wrap gallery-page news-post-page page-view">
      {isLoadingPost && <div style={{ textAlign: "center", padding: "48px 0", color: "var(--ink-2)" }}>Đang tải bài viết…</div>}
      {postError && <div style={{ textAlign: "center", padding: "48px 0", color: "#ef4444" }}>{postError}</div>}

      {!isLoadingPost && !postError && post && (
        <article className="news-post" style={{ maxWidth: 840, margin: "0 auto" }}>
          <Link
            to="/tin-tuc"
            className="btn-pill-ghost"
            style={{ marginBottom: 28, display: "inline-flex" }}
          >
            <LeftOutlined />
            <span>Tất cả tin tức</span>
          </Link>
          <header className="news-post-head" style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span className="tag-pill tag-pill-yellow">
                <CalendarOutlined style={{ marginRight: 4 }} />
                {formatNewsDate(post.date)}
              </span>
              <span className="tag-pill" style={{ background: "var(--surface-2)", color: "var(--ink-2)", border: "1px solid var(--line-strong)" }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {estimateReadMinutes(post.content)} phút đọc
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 4.4vw, 2.8rem)", fontWeight: 900, color: "var(--ink)", lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.03em" }}>
              {post.title}
            </h1>
            {post.description && (
              <p style={{ fontSize: "1.15rem", color: "var(--ink-2)", lineHeight: 1.65, fontStyle: "italic", borderLeft: "3px solid var(--brand)", paddingLeft: 16 }}>
                {post.description}
              </p>
            )}
          </header>
          {post.cover && !post.demo && (
            <img
              style={{ width: "100%", maxHeight: 500, objectFit: "cover", borderRadius: "var(--radius-xl)", marginBottom: 36, border: "2px solid var(--ink)", boxShadow: "0 6px 0 var(--ink)" }}
              src={driveImage(post.cover, 1600)}
              alt={post.title}
              decoding="async"
            />
          )}
          <div style={{ fontSize: "1.08rem", lineHeight: 1.85, color: "var(--ink)" }}>
            <Markdown
              content={post.content}
              imageMap={imageMap}
              coverId={post.cover}
            />
          </div>
          <footer style={{ marginTop: 48, paddingTop: 28, borderTop: "2px solid var(--line)" }}>
            <Link
              to="/tin-tuc"
              className="btn-aardvark"
            >
              <span className="btn-text-part">Xem các bài viết khác</span>
              <span className="btn-icon-part">
                <LeftOutlined />
              </span>
            </Link>
          </footer>
        </article>
      )}
    </main>
  );
}
