import React, { useState, useEffect } from 'react';
import { Comment as CommentType } from '../types';
import { supabase } from '../lib/supabase';
import { ThumbsUp, Reply } from 'lucide-react';

interface CommentProps {
  comment: CommentType;
  postId: string;
  level?: number;
  onCommentUpdated: () => void;
}

const Comment: React.FC<CommentProps> = ({
  comment,
  postId,
  level = 0,
  onCommentUpdated
}) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyName, setReplyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storedLikes = JSON.parse(localStorage.getItem('likedComments') || '{}');
    setLikedComments(storedLikes);
  }, []);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyName.trim() || !replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await supabase
        .from("comments")
        .insert([
          {
            post_id: postId,
            name: replyName.trim(),
            comment: replyText.trim(),
            parent_id: comment.id,
          },
        ]);

      setReplyName('');
      setReplyText('');
      setShowReplyBox(false);
      onCommentUpdated();
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const likeComment = async (commentId: string) => {
    if (likedComments[commentId]) return;

    try {
      await supabase.rpc("increment_comment_likes", { comment_id_input: commentId });

      const updatedLikedComments = { ...likedComments, [commentId]: true };
      setLikedComments(updatedLikedComments);
      localStorage.setItem('likedComments', JSON.stringify(updatedLikedComments));

      onCommentUpdated();
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  return (
    <div
      style={{
        marginLeft: `${level * 20}px`,
        marginTop: '1rem',
        borderLeft: level ? '2px solid #e5e7eb' : 'none',
        paddingLeft: level ? '1rem' : '0'
      }}
    >
      <div className="p-4 rounded bg-gray-100 dark:bg-black text-gray-900 dark:text-white">
        <h3 className="font-semibold">{comment.name}</h3>
        <p>{comment.comment}</p>
        <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-white">
          <button
            onClick={() => likeComment(comment.id)}
            disabled={likedComments[comment.id]}
            className="flex items-center gap-1"
          >
            <ThumbsUp size={14} className={likedComments[comment.id] ? "text-white" : ""} />
            <span>{comment.likes}</span>
          </button>

          <button
            onClick={() => setShowReplyBox(!showReplyBox)}
            className="flex items-center gap-1"
          >
            <Reply size={14} />
            <span>{showReplyBox ? "Cancel" : "Reply"}</span>
          </button>
        </div>
      </div>

      {showReplyBox && (
        <form onSubmit={handleReplySubmit} className="mt-3 pl-4">
          <input
            type="text"
            value={replyName}
            onChange={(e) => setReplyName(e.target.value)}
            placeholder="Your name"
            className="comment-input"
            required
          />
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Your reply"
            className="comment-textarea"
            required
          />
          <button
            type="submit"
            className="comment-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post Reply"}
          </button>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              postId={postId}
              level={level + 1}
              onCommentUpdated={onCommentUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CommentListProps {
  comments: CommentType[];
  postId: string;
  onCommentUpdated: () => void;
}

const CommentList: React.FC<CommentListProps> = ({ comments, postId, onCommentUpdated }) => {
  return (
    <div className="mt-8">
      {comments.length === 0 ? (
        <p className="text-gray-600 dark:text-blue-300 italic">No comments yet. Be the first to comment!</p>
      ) : (
        comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            postId={postId}
            onCommentUpdated={onCommentUpdated}
          />
        ))
      )}
    </div>
  );
};

export default CommentList;
