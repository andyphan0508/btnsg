import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PiArrowLeft, PiCalendarBlank, PiClock } from "react-icons/pi";
import Markdown from "../components/Markdown.jsx";
import RollText from "../components/RollText.jsx";
import { driveImage } from "../lib/gallery.js";
import { fetchPost, formatNewsDate, readNewsCache, subscribeWindowFocus } from "../lib/news.js";

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
    <main className="wrap article-page">
      {isLoadingPost && <div className="status">Đang tải bài viết…</div>}
      {postError && <div className="status is-error">{postError}</div>}

      {!isLoadingPost && !postError && post && (
        <article className="article">
          <Link to="/tin-tuc" className="chip">
            <PiArrowLeft aria-hidden="true" />
            <span>Tất cả tin tức</span>
          </Link>

          <header className="article-head">
            <div className="article-meta">
              <span className="chip">
                <PiCalendarBlank aria-hidden="true" />
                {formatNewsDate(post.date)}
              </span>
              <span className="chip">
                <PiClock aria-hidden="true" />
                {estimateReadMinutes(post.content)} phút đọc
              </span>
            </div>
            <h1 className="article-title">{post.title}</h1>
            {post.description && <p className="article-desc">{post.description}</p>}
          </header>

          {post.cover && !post.demo && (
            <img className="article-cover" src={driveImage(post.cover, 1600)} alt={post.title} decoding="async" />
          )}

          <Markdown content={post.content} imageMap={imageMap} coverId={post.cover} />

          <footer className="article-foot">
            <Link to="/tin-tuc" className="btn btn-glass">
              <PiArrowLeft aria-hidden="true" />
              <RollText text="Xem các bài viết khác" />
            </Link>
          </footer>
        </article>
      )}
    </main>
  );
}
