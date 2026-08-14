"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  addSlipCommentAction,
  deleteSlipCommentAction,
} from "@/app/actions/comments";
import type { SlipCommentWithAuthor } from "@/types/database";

function CommentsIcon() {
  return (
    <svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true">
      <path
        d="M4.2 3.6h11.6A1.7 1.7 0 0 1 17.5 5.3v6.4a1.7 1.7 0 0 1-1.7 1.7H9.1L5.4 16.6v-3.2H4.2A1.7 1.7 0 0 1 2.5 11.7V5.3A1.7 1.7 0 0 1 4.2 3.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SlipComments({
  weekId,
  targetPlayerId,
  comments,
  currentPlayerId,
  isAdmin = false,
}: {
  weekId: string;
  targetPlayerId: string;
  comments: SlipCommentWithAuthor[];
  currentPlayerId: string;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setError(null);
    startTransition(async () => {
      const result = await addSlipCommentAction({
        weekId,
        targetPlayerId,
        body: trimmed,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  }

  function onDelete(commentId: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteSlipCommentAction(commentId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="slip-comments">
      <div className="slip-comments-head">
        <span className="slip-comments-title">
          <CommentsIcon />
          Yorumlar
        </span>
        {comments.length > 0 ? (
          <span className="slip-comments-count">{comments.length}</span>
        ) : null}
      </div>

      {comments.length === 0 ? (
        <p className="muted slip-comments-empty">Henüz yorum yok.</p>
      ) : (
        <ul className="slip-comments-list">
          {comments.map((comment) => {
            const canDelete =
              comment.author_player_id === currentPlayerId || isAdmin;
            return (
              <li key={comment.id} className="slip-comment-line">
                <div className="slip-comment-main">
                  <span className="slip-comment-author">
                    {comment.author.display_name}
                  </span>
                  <p className="slip-comment-body">{comment.body}</p>
                </div>
                {canDelete ? (
                  <button
                    type="button"
                    className="slip-comment-delete"
                    disabled={pending}
                    onClick={() => onDelete(comment.id)}
                    aria-label="Yorumu sil"
                    title="Sil"
                  >
                    ×
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <div className="slip-comment-compose">
        <input
          className="slip-comment-input"
          type="text"
          maxLength={280}
          placeholder="Yorum yaz..."
          value={body}
          disabled={pending}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={pending || !body.trim()}
          onClick={submit}
        >
          {pending ? "..." : "Gönder"}
        </button>
      </div>
      {error ? <p className="flash flash-error">{error}</p> : null}
    </div>
  );
}
