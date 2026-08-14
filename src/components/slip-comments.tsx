"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import {
  addSlipCommentAction,
  deleteSlipCommentAction,
  toggleSlipCommentReactionAction,
} from "@/app/actions/comments";
import {
  summarizeCommentReactions,
  toggleReactionList,
  type SlipReactionKey,
} from "@/lib/slip-reactions";
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
  const [saving, startSave] = useTransition();
  const [reacting, startReact] = useTransition();
  const [optimisticComments, setOptimisticComments] = useOptimistic(
    comments,
    (
      current,
      update: { commentId: string; key: SlipReactionKey },
    ): SlipCommentWithAuthor[] =>
      current.map((comment) =>
        comment.id === update.commentId
          ? {
              ...comment,
              reactions: toggleReactionList(
                comment.reactions ?? [],
                currentPlayerId,
                update.key,
              ),
            }
          : comment,
      ),
  );

  function submit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setError(null);
    startSave(async () => {
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
    startSave(async () => {
      const result = await deleteSlipCommentAction(commentId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function onReact(commentId: string, key: SlipReactionKey) {
    setError(null);
    startReact(async () => {
      setOptimisticComments({ commentId, key });
      const result = await toggleSlipCommentReactionAction({
        commentId,
        reaction: key,
      });
      if (result.error) {
        setError(result.error);
        router.refresh();
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
        {optimisticComments.length > 0 ? (
          <span className="slip-comments-count">{optimisticComments.length}</span>
        ) : null}
      </div>

      {optimisticComments.length === 0 ? (
        <p className="muted slip-comments-empty">Henüz yorum yok.</p>
      ) : (
        <ul className="slip-comments-list">
          {optimisticComments.map((comment) => {
            const canDelete =
              comment.author_player_id === currentPlayerId || isAdmin;
            const chips = summarizeCommentReactions(
              comment.reactions ?? [],
              currentPlayerId,
            );
            return (
              <li key={comment.id} className="slip-comment-line">
                <div className="slip-comment-top">
                  <span className="slip-comment-author">
                    {comment.author.display_name}
                  </span>
                  {canDelete ? (
                    <button
                      type="button"
                      className="slip-comment-delete"
                      disabled={saving}
                      onClick={() => onDelete(comment.id)}
                      aria-label="Yorumu sil"
                      title="Sil"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
                <p className="slip-comment-body">{comment.body}</p>
                <div className="slip-comment-reactions">
                  {chips.map((chip) => {
                    const title = chip.mine
                      ? `${chip.label} — sen verdin${chip.count > 1 ? `, ${chip.count}` : ""}`
                      : chip.count > 0
                        ? `${chip.label} — ${chip.count}`
                        : chip.label;
                    return (
                      <button
                        key={chip.key}
                        type="button"
                        className={`slip-reaction${chip.mine ? " slip-reaction-on" : ""}`}
                        disabled={reacting}
                        aria-pressed={chip.mine}
                        aria-label={title}
                        title={title}
                        onClick={() => onReact(comment.id, chip.key)}
                      >
                        <span aria-hidden="true">{chip.glyph}</span>
                        {chip.count > 0 ? (
                          <span className="slip-reaction-count">{chip.count}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
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
          disabled={saving}
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
          disabled={saving || !body.trim()}
          onClick={submit}
        >
          {saving ? "..." : "Gönder"}
        </button>
      </div>
      {error ? <p className="flash flash-error">{error}</p> : null}
    </div>
  );
}
