import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PiArrowLeft, PiCalendarBlank, PiCheck, PiClock, PiFacebookLogo, PiLink } from "react-icons/pi";
import { stripHtmlToText } from "@btnsg/shared";
import Markdown from "../components/Markdown.jsx";
import RollText from "../components/RollText.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { ArticleSkeleton } from "../components/Skeleton.jsx";
import { driveImage } from "../lib/gallery.js";
import { fetchPost, formatNewsDate, readNewsCache, subscribeWindowFocus } from "../lib/news.js";

const estimateReadMinutes = (content) => {
  const plain = stripHtmlToText(content || "");
  if (!plain) return 1;
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

export default function NewsPost() {
  const { postId } = useParams();
  const [post, setPost] = useState(() => readNewsCache(`post:${postId}`));
  const [isLoadingPost, setIsLoadingPost] = useState(!post);
  const [postError, setPostError] = useState(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const fbShareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore clipboard block
    }
  };

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

  const onRetry = () => {
    setIsLoadingPost(true);
    setPostError(null);
    loadPost(false);
  };

  return (
    <main className="wrap article-page">
      {isLoadingPost && <ArticleSkeleton />}
      {!isLoadingPost && postError && (
        <EmptyState
          icon="error"
          variant="error"
          eyebrow="Không tìm thấy bài viết"
          title="Chưa thể mở bài viết này"
          description={postError}
          action={{ label: "Tất cả tin tức", to: "/tin-tuc", icon: "back" }}
          secondaryAction={{ label: "Thử lại", onClick: onRetry, icon: "retry" }}
        />
      )}
      {!isLoadingPost && !postError && !post && (
        <EmptyState
          icon="news"
          eyebrow="Tin tức"
          title="Bài viết chưa có nội dung"
          description="Bài viết này có thể đã được gỡ bỏ hoặc chưa được xuất bản."
          action={{ label: "Tất cả tin tức", to: "/tin-tuc", icon: "back" }}
        />
      )}

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
