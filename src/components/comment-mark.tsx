export function CommentMark({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span
      className="comment-mark"
      title={`${count} yorum`}
      aria-label={`${count} yorum`}
    >
      <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
        <path
          d="M4.2 3.6h11.6A1.7 1.7 0 0 1 17.5 5.3v6.4a1.7 1.7 0 0 1-1.7 1.7H9.1L5.4 16.6v-3.2H4.2A1.7 1.7 0 0 1 2.5 11.7V5.3A1.7 1.7 0 0 1 4.2 3.6Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.55"
          strokeLinejoin="round"
        />
      </svg>
      <span className="comment-mark-count">{count}</span>
    </span>
  );
}
