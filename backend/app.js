const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const friendRoutes = require('./routes/friendRoutes');
const { ensureDbFile } = (() => {
  const service = require('./services/dataStore');
  return { ensureDbFile: async () => service.readDb() };
})();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', async (_req, res) => {
  await ensureDbFile();
  res.json({
    message: 'API du Blog Personnel opérationnelle',
    mode: 'file-storage',
    endpoints: ['/api/users', '/api/articles', '/api/friends']
  });
});

app.use('/api/users', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/friends', friendRoutes);

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  ensureDbFile().then(() => {
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  });
}

module.exports = app;
