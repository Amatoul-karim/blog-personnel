import { useState } from 'react';
import { searchUsers, sendFriendRequest } from '../../services/api';

const relationLabels = {
  none: 'Aucune relation',
  friend: 'Déjà ami',
  pending_sent: 'Invitation envoyée',
  pending_received: 'Invitation reçue',
  blocked: 'Utilisateur bloqué',
  blocked_by_user: 'Vous êtes bloqué'
};

function AjoutAmis({ onRefresh }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const users = await searchUsers(query);
      setResults(users);
      if (!users.length) {
        setMessage('Aucun utilisateur trouvé.');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Recherche impossible.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (recipientId) => {
    setMessage('');
    try {
      const response = await sendFriendRequest(recipientId);
      setMessage(response.message);
      const refreshed = await searchUsers(query);
      setResults(refreshed);
      await onRefresh();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Envoi impossible.');
    }
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Rechercher des amis</h2>
          <p>Trouvez d’autres utilisateurs par nom complet ou nom d’utilisateur.</p>
        </div>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un utilisateur"
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Recherche…' : 'Rechercher'}
        </button>
      </form>

      {message ? <p className="helper-message">{message}</p> : null}

      <div className="user-grid">
        {results.map((user) => {
          const canInvite = user.relationStatus === 'none';
          return (
            <article className="user-card" key={user.id}>
              <div>
                <h3>{user.fullName}</h3>
                <p>@{user.username}</p>
                <span className="tag tag-neutral">{relationLabels[user.relationStatus]}</span>
              </div>
              <button
                className="btn btn-secondary"
                type="button"
                disabled={!canInvite}
                onClick={() => handleAdd(user.id)}
              >
                {canInvite ? 'Ajouter' : 'Indisponible'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default AjoutAmis;
