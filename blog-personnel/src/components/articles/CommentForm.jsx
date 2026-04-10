import { useState } from 'react';
import { addCommentToArticle } from '../../services/api';

function CommentForm({ articleId, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError('Le commentaire ne peut pas être vide.');
      return;
    }

    try {
      setSubmitting(true);
      const updatedArticle = await addCommentToArticle(articleId, { content: trimmedContent });
      if (onCommentAdded) {
        await onCommentAdded(updatedArticle);
      }
      setContent('');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Erreur lors de l’ajout du commentaire.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Ajoutez un commentaire..."
        required
      />
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Publication…' : 'Poster'}
      </button>
      {error ? <p className="error-message">{error}</p> : null}
    </form>
  );
}

export default CommentForm;