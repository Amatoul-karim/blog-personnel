const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'db.json');

const defaultDb = {
  users: [],
  friendRequests: [],
  articles: []
};

async function ensureDbFile() {
  await fs.promises.mkdir(dataDir, { recursive: true });
  try {
    await fs.promises.access(dbPath);
  } catch {
    await fs.promises.writeFile(dbPath, JSON.stringify(defaultDb, null, 2), 'utf8');
  }
}

async function readDb() {
  await ensureDbFile();
  const raw = await fs.promises.readFile(dbPath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    await fs.promises.writeFile(dbPath, JSON.stringify(defaultDb, null, 2), 'utf8');
    return { ...defaultDb };
  }
}

async function writeDb(db) {
  await ensureDbFile();
  await fs.promises.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
  return db;
}

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function findUserById(db, userId) {
  return db.users.find((user) => user.id === userId);
}

function findUserByUsername(db, username) {
  return db.users.find(
    (user) => user.username.toLowerCase() === String(username).toLowerCase()
  );
}

function isBlocked(db, blockerId, blockedId) {
  const blocker = findUserById(db, blockerId);
  return Boolean(blocker?.blockedUserIds?.includes(blockedId));
}

function getAcceptedFriendIds(db, userId) {
  return db.friendRequests
    .filter(
      (request) =>
        request.status === 'accepted' &&
        (request.requesterId === userId || request.recipientId === userId)
    )
    .map((request) =>
      request.requesterId === userId ? request.recipientId : request.requesterId
    );
}

module.exports = {
  dbPath,
  readDb,
  writeDb,
  sanitizeUser,
  findUserById,
  findUserByUsername,
  isBlocked,
  getAcceptedFriendIds
};
