const { randomUUID } = require('crypto');
const {
  readDb,
  writeDb,
  sanitizeUser,
  findUserById,
  findUserByUsername,
  isBlocked,
  getAcceptedFriendIds
} = require('../services/dataStore');

function getRelationStatus(db, currentUserId, otherUserId) {
  if (isBlocked(db, currentUserId, otherUserId)) return 'blocked';
  if (isBlocked(db, otherUserId, currentUserId)) return 'blocked_by_user';

  const accepted = getAcceptedFriendIds(db, currentUserId).includes(otherUserId);
  if (accepted) return 'friend';

  const request = db.friendRequests.find(
    (item) =>
      item.status === 'pending' &&
      ((item.requesterId === currentUserId && item.recipientId === otherUserId) ||
        (item.requesterId === otherUserId && item.recipientId === currentUserId))
  );

  if (!request) return 'none';
  return request.requesterId === currentUserId ? 'pending_sent' : 'pending_received';
}

function buildPublicUser(db, currentUserId, user) {
  return {
    ...sanitizeUser(user),
    relationStatus: getRelationStatus(db, currentUserId, user.id)
  };
}

exports.searchUsers = async (req, res) => {
  try {
    const query = String(req.query.username || '').trim().toLowerCase();
    const db = await readDb();

    const users = db.users
      .filter((user) => user.id !== req.userId)
      .filter((user) => {
        if (!query) return true;
        return (
          user.username.toLowerCase().includes(query) ||
          user.fullName.toLowerCase().includes(query)
        );
      })
      .map((user) => buildPublicUser(db, req.userId, user))
      .sort((a, b) => a.username.localeCompare(b.username))
      .slice(0, 20);

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const db = await readDb();
    const requester = findUserById(db, req.userId);
    const recipient = req.body.recipientId
      ? findUserById(db, req.body.recipientId)
      : findUserByUsername(db, req.body.username);

    if (!requester || !recipient) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    if (requester.id === recipient.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous ajouter vous-même.' });
    }

    if (isBlocked(db, requester.id, recipient.id) || isBlocked(db, recipient.id, requester.id)) {
      return res.status(403).json({ message: 'Relation impossible à cause d’un blocage.' });
    }

    const relationStatus = getRelationStatus(db, requester.id, recipient.id);
    if (relationStatus !== 'none') {
      return res.status(409).json({ message: 'Cette relation existe déjà ou est en attente.' });
    }

    const request = {
      id: randomUUID(),
      requesterId: requester.id,
      recipientId: recipient.id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.friendRequests.push(request);
    await writeDb(db);

    return res.status(201).json({ message: 'Demande d’ami envoyée.', request });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const db = await readDb();
    const requests = db.friendRequests
      .filter(
        (request) =>
          request.status === 'pending' &&
          (request.requesterId === req.userId || request.recipientId === req.userId)
      )
      .map((request) => ({
        ...request,
        requester: sanitizeUser(findUserById(db, request.requesterId)),
        recipient: sanitizeUser(findUserById(db, request.recipientId))
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const db = await readDb();
    const request = db.friendRequests.find((item) => item.id === req.params.id);

    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: 'Demande introuvable.' });
    }

    if (request.recipientId !== req.userId) {
      return res.status(403).json({ message: 'Action non autorisée.' });
    }

    if (isBlocked(db, request.requesterId, request.recipientId) || isBlocked(db, request.recipientId, request.requesterId)) {
      return res.status(403).json({ message: 'Impossible d’accepter cette demande.' });
    }

    request.status = 'accepted';
    request.acceptedAt = new Date().toISOString();
    await writeDb(db);

    return res.json({ message: 'Demande acceptée.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const db = await readDb();
    const friendIds = getAcceptedFriendIds(db, req.userId);
    const friends = friendIds
      .map((friendId) => findUserById(db, friendId))
      .filter(Boolean)
      .map((friend) => buildPublicUser(db, req.userId, friend))
      .sort((a, b) => a.username.localeCompare(b.username));

    return res.json(friends);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const db = await readDb();
    const targetUserId = req.params.id;

    const initialLength = db.friendRequests.length;
    db.friendRequests = db.friendRequests.filter(
      (request) =>
        !(
          (request.requesterId === req.userId && request.recipientId === targetUserId) ||
          (request.requesterId === targetUserId && request.recipientId === req.userId)
        )
    );

    if (db.friendRequests.length === initialLength) {
      return res.status(404).json({ message: 'Aucune relation trouvée.' });
    }

    await writeDb(db);
    return res.json({ message: 'Relation supprimée.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const db = await readDb();
    const user = findUserById(db, req.userId);
    const targetUser = findUserById(db, req.params.id);

    if (!user || !targetUser) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    if (user.id === targetUser.id) {
      return res.status(400).json({ message: 'Action invalide.' });
    }

    if (!user.blockedUserIds.includes(targetUser.id)) {
      user.blockedUserIds.push(targetUser.id);
    }

    db.friendRequests = db.friendRequests.filter(
      (request) =>
        !(
          (request.requesterId === req.userId && request.recipientId === targetUser.id) ||
          (request.requesterId === targetUser.id && request.recipientId === req.userId)
        )
    );

    await writeDb(db);
    return res.json({ message: 'Utilisateur bloqué.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};
