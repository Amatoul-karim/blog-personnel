const { randomUUID } = require('crypto');
const {
  readDb,
  writeDb,
  findUserById,
  isBlocked,
  getAcceptedFriendIds
} = require('../services/dataStore');

function serializeArticle(db, article) {
  const author = findUserById(db, article.authorId);
  return {
    ...article,
    comments: Array.isArray(article.comments)
      ? article.comments.map((comment) => {
          const commentAuthor = findUserById(db, comment.authorId);
          return {
            ...comment,
            author: commentAuthor
              ? {
                  id: commentAuthor.id,
                  fullName: commentAuthor.fullName,
                  username: commentAuthor.username
                }
              : null
          };
        })
      : [],
    author: author
      ? {
          id: author.id,
          fullName: author.fullName,
          username: author.username
        }
      : null
  };
}

exports.getFeed = async (req, res) => {
  try {
    const db = await readDb();
    const userId = req.userId;
    const friendIds = getAcceptedFriendIds(db, userId);
    const visibleAuthorIds = new Set([userId, ...friendIds]);

    const articles = db.articles
      .filter((article) => {
        if (!visibleAuthorIds.has(article.authorId)) return false;

        if (article.authorId === userId) return true;
        if (!article.isPublic) return false;
        if (isBlocked(db, article.authorId, userId)) return false;
        if (isBlocked(db, userId, article.authorId)) return false;

        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((article) => serializeArticle(db, article));

    return res.json(articles);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getMyArticles = async (req, res) => {
  try {
    const db = await readDb();
    const articles = db.articles
      .filter((article) => article.authorId === req.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((article) => serializeArticle(db, article));

    return res.json(articles);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const { title, content, isPublic = true, allowComments = true } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: 'Le titre et le contenu sont obligatoires.' });
    }

    const db = await readDb();
    const now = new Date().toISOString();
    const article = {
      id: randomUUID(),
      authorId: req.userId,
      title: title.trim(),
      content: content.trim(),
      isPublic: Boolean(isPublic),
      allowComments: Boolean(allowComments),
      comments: [],
      createdAt: now,
      updatedAt: now
    };

    db.articles.push(article);
    await writeDb(db);

    return res.status(201).json(serializeArticle(db, article));
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const db = await readDb();
    const article = db.articles.find((item) => item.id === req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article introuvable.' });
    }

    if (article.authorId !== req.userId) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    const { title, content, isPublic, allowComments } = req.body;

    article.title = title?.trim() || article.title;
    article.content = content?.trim() || article.content;
    article.isPublic = typeof isPublic === 'boolean' ? isPublic : article.isPublic;
    article.allowComments =
      typeof allowComments === 'boolean' ? allowComments : article.allowComments;
    article.updatedAt = new Date().toISOString();

    await writeDb(db);

    return res.json(serializeArticle(db, article));
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const db = await readDb();
    const articleIndex = db.articles.findIndex((item) => item.id === req.params.id);

    if (articleIndex === -1) {
      return res.status(404).json({ message: 'Article introuvable.' });
    }

    if (db.articles[articleIndex].authorId !== req.userId) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    db.articles.splice(articleIndex, 1);
    await writeDb(db);

    return res.json({ message: 'Article supprimé.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// Ajouter un commentaire à un article
exports.addComment = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Le commentaire ne peut pas être vide.' });
    }

    const db = await readDb();
    const article = db.articles.find((item) => item.id === articleId);

    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé.' });
    }

    if (!article.allowComments) {
      return res.status(403).json({
        message: 'Les commentaires ne sont pas autorisés sur cet article.'
      });
    }

    if (article.authorId !== req.userId) {
      const friendIds = getAcceptedFriendIds(db, article.authorId);
      const canAccessArticle =
        article.isPublic &&
        friendIds.includes(req.userId) &&
        !isBlocked(db, article.authorId, req.userId) &&
        !isBlocked(db, req.userId, article.authorId);

      if (!canAccessArticle) {
        return res.status(403).json({ message: 'Vous ne pouvez pas commenter cet article.' });
      }
    }

    const comment = {
      id: randomUUID(),
      authorId: req.userId,
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    if (!Array.isArray(article.comments)) {
      article.comments = [];
    }

    article.comments.push(comment);
    article.updatedAt = new Date().toISOString();
    await writeDb(db);

    return res.status(201).json(serializeArticle(db, article));
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};



