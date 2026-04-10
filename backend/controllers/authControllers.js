const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const {
  readDb,
  writeDb,
  sanitizeUser,
  findUserById,
  findUserByUsername
} = require('../services/dataStore');

function createToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'blog-secret', {
    expiresIn: '7d'
  });
}

exports.register = async (req, res) => {
  try {
    const { fullName, username, password } = req.body;

    if (!fullName || !username || !password) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const db = await readDb();
    const existingUser = findUserByUsername(db, username);

    if (existingUser) {
      return res.status(409).json({ message: 'Ce nom d’utilisateur est déjà utilisé.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: randomUUID(),
      fullName: fullName.trim(),
      username: username.trim(),
      passwordHash,
      blockedUserIds: [],
      createdAt: new Date().toISOString()
    };

    db.users.push(user);
    await writeDb(db);

    const safeUser = sanitizeUser(user);
    return res.status(201).json({
      message: 'Inscription réussie.',
      token: createToken(user),
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Nom d’utilisateur et mot de passe requis.' });
    }

    const db = await readDb();
    const user = findUserByUsername(db, username);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    return res.json({
      message: 'Connexion réussie.',
      token: createToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const db = await readDb();
    const user = findUserById(db, req.userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    return res.json(sanitizeUser(user));
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
