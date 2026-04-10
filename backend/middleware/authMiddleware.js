const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.header('Authorization');

  if (!header) {
    return res.status(401).json({ message: 'Accès refusé.' });
  }

  const token = header.startsWith('Bearer ') ? header.slice(7) : header;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'blog-secret');
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide.' });
  }
};
