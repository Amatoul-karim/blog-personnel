import CommentForm from './CommentForm';
function formatDate(value) {
  return new Date(value).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}
// ______________________

// ________________
function ArticleList({
  title,
  description,
  articles,
  emptyMessage,
  showAuthor = false,
  onEdit,
  onDelete,
  onCommentAdded
}) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
      </div>

      <div className="article-list">
        {articles.length === 0 ? (
          <p className="empty-state">{emptyMessage}</p>
        ) : (
          articles.map((article) => (
            <article className="article-card" key={article.id}>
               {showAuthor && article.author ? (
                <p className="article-author">
                  Article publier Par <strong>{article.author.fullName}</strong> (@{article.author.username})
                </p>
              ) : null}
              <div className="article-header">
                <div>
                  
                  <div className="meta-row">
                    <span className={`tag ${article.isPublic ? 'tag-public' : 'tag-private'}`}>
                      {article.isPublic ? 'Public' : 'Privé'}
                    </span>
                    <span className="tag tag-neutral">
                      {article.allowComments ? 'Commentaires actifs' : 'Commentaires fermés'}
                    </span>
                  </div>
                  <h3>{article.title}</h3>
                </div>
                <time>{formatDate(article.updatedAt || article.createdAt)}</time>
              </div>
            
             

              <p className="article-content">{article.content}</p>
              {/* _____________ */}
              <section className='panel'>
               {article.allowComments && (
                <>
                  <div className="comments-section">
                    <h4>Commentaires</h4>
                    {article.comments && article.comments.length > 0 ? (
                      article.comments.map((comment, index) => (
                        <div key={index} className="comment">
                          <p><strong>{comment.author.fullName}</strong>: {comment.content}</p>
                          <small>{formatDate(comment.createdAt)}</small>
                        </div>
                      ))
                    ) : (
                      <p>Aucun commentaire pour le moment.</p>
                    )}
                  </div>
                  <CommentForm articleId={article.id} onCommentAdded={onCommentAdded} />
                </>
              )}
              </section>
              {/* _______ */}

              {onEdit || onDelete ? (
                <div className="card-actions">
                  {onEdit ? (
                    <button className="btn btn-secondary" onClick={() => onEdit(article)}>
                      Modifier
                    </button>
                  ) : null}
                  {onDelete ? (
                    <button className="btn btn-danger" onClick={() => onDelete(article.id)}>
                      Supprimer
                    </button>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default ArticleList;
