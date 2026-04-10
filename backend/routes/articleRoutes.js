const express = require('express');
const router = express.Router();
const { addComment } = require('../controllers/articleController');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getFeed,
  getMyArticles,
  createArticle,
  updateArticle,
  deleteArticle
} = require('../controllers/articleController');

router.use(authMiddleware);
router.get('/feed', getFeed);
router.get('/mine', getMyArticles);
router.post('/', createArticle);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);

router.post('/:articleId/comments', addComment);

module.exports = router;
