import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface CommentFormProps {
  postId: string;
  onCommentAdded: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, onCommentAdded }) => {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      await supabase
        .from("comments")
        .insert([{
          post_id: postId,
          name: name.trim(),
          comment: comment.trim(),
        }]);

      setName('');
      setComment('');
      onCommentAdded();
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Failed to submit comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Leave a Comment</h2>
      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="comment-input"
          required
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Your comment"
          className="comment-textarea"
          required
        />
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="comment-submit-button"
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </button>
      </form>
    </div>
  );
};

export default CommentForm;