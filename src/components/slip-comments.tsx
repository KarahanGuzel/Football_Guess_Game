"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  addSlipCommentAction,
  deleteSlipCommentAction,
} from "@/app/actions/comments";
import type { SlipCommentWithAuthor } from "@/types/database";

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
        <span className="slip-comments-title">Yorumlar</span>
        {comments.length > 0 ? (
          <span className="muted slip-comments-count">{comments.length}</span>
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
                <p className="slip-comment-text">
                  <span className="slip-comment-author">
                    {comment.author.display_name}:
                  </span>{" "}
                  <span className="slip-comment-body">{comment.body}</span>
                </p>
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
