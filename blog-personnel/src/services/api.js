import api from '../axiosConfig';

export async function loginUser(payload) {
  const { data } = await api.post('/api/users/login', payload);
  return data;
}

export async function registerUser(payload) {
  const { data } = await api.post('/api/users/register', payload);
  return data;
}

export async function getMe() {
  const { data } = await api.get('/api/users/me');
  return data;
}

export async function getFeed() {
  const { data } = await api.get('/api/articles/feed');
  return data;
}

export async function getMyArticles() {
  const { data } = await api.get('/api/articles/mine');
  return data;
}

export async function createArticle(payload) {
  const { data } = await api.post('/api/articles', payload);
  return data;
}

export async function updateArticle(articleId, payload) {
  const { data } = await api.put(`/api/articles/${articleId}`, payload);
  return data;
}

export async function deleteArticle(articleId) {
  const { data } = await api.delete(`/api/articles/${articleId}`);
  return data;
}

export async function addCommentToArticle(articleId, payload) {
  const { data } = await api.post(`/api/articles/${articleId}/comments`, payload);
  return data;
}

export async function searchUsers(username) {
  const { data } = await api.get('/api/friends/search', {
    params: { username }
  });
  return data;
}

export async function getFriendRequests() {
  const { data } = await api.get('/api/friends/requests');
  return data;
}

export async function sendFriendRequest(recipientId) {
  const { data } = await api.post('/api/friends/requests', { recipientId });
  return data;
}

export async function acceptFriendRequest(requestId) {
  const { data } = await api.post(`/api/friends/requests/${requestId}/accept`);
  return data;
}

export async function getFriends() {
  const { data } = await api.get('/api/friends');
  return data;
}

export async function removeFriend(userId) {
  const { data } = await api.delete(`/api/friends/${userId}`);
  return data;
}

export async function blockUser(userId) {
  const { data } = await api.post(`/api/friends/block/${userId}`);
  return data;
}
