import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import {
  acceptFriendRequest,
  blockUser,
  createArticle,
  deleteArticle,
  getFeed,
  getFriendRequests,
  getFriends,
  getMyArticles,
  removeFriend,
  updateArticle
} from '../../services/api';
import AjoutAmis from '../amis/AjoutAmis';
import ListAmis from '../amis/ListAmis';
import ArticleForm from '../articles/ArticleForm';
import ArticleList from '../articles/ArticleList';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [articles, setArticles] = useState([]);
  const [feed, setFeed] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [editingArticle, setEditingArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingArticle, setSavingArticle] = useState(false);
  const [notice, setNotice] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [myArticles, feedArticles, friendsList, requestsList] = await Promise.all([
        getMyArticles(),
        getFeed(),
        getFriends(),
        getFriendRequests()
      ]);

      setArticles(myArticles);
      setFeed(feedArticles);
      setFriends(friendsList);
      setRequests(requestsList);
    } catch (error) {
      setNotice(error.response?.data?.message || 'Impossible de charger le tableau de bord.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const incomingRequests = useMemo(
    () => requests.filter((request) => request.recipientId === user?.id),
    [requests, user?.id]
  );

  const outgoingRequests = useMemo(
    () => requests.filter((request) => request.requesterId === user?.id),
    [requests, user?.id]
  );

  const stats = [
    { label: 'Mes articles', value: articles.length },
    { label: 'Articles visibles dans le flux', value: feed.length },
    { label: 'Amis confirmés', value: friends.length },
    { label: 'Demandes reçues', value: incomingRequests.length }
  ];

  const handleArticleSubmit = async (formData) => {
    setSavingArticle(true);
    setNotice('');

    try {
      if (editingArticle?.id) {
        await updateArticle(editingArticle.id, formData);
        setNotice('Article mis à jour avec succès.');
      } else {
        await createArticle(formData);
        setNotice('Article publié avec succès.');
      }
      setEditingArticle(null);
      await loadDashboard();
    } catch (error) {
      setNotice(error.response?.data?.message || 'Impossible d’enregistrer l’article.');
    } finally {
      setSavingArticle(false);
    }
  };

  const handleDeleteArticle = async (articleId) => {
    try {
      await deleteArticle(articleId);
      setNotice('Article supprimé.');
      if (editingArticle?.id === articleId) {
        setEditingArticle(null);
      }
      await loadDashboard();
    } catch (error) {
      setNotice(error.response?.data?.message || 'Suppression impossible.');
    }
  };

  const handleCommentAdded = async () => {
    setNotice('Commentaire publié avec succès.');
    await loadDashboard();
  };

  const handleAccept = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
      setNotice('Demande acceptée.');
      await loadDashboard();
    } catch (error) {
      setNotice(error.response?.data?.message || 'Action impossible.');
    }
  };

  const handleRemove = async (friendId) => {
    try {
      await removeFriend(friendId);
      setNotice('Relation supprimée.');
      await loadDashboard();
    } catch (error) {
      setNotice(error.response?.data?.message || 'Action impossible.');
    }
  };

  const handleBlock = async (friendId) => {
    try {
      await blockUser(friendId);
      setNotice('Utilisateur bloqué.');
      await loadDashboard();
    } catch (error) {
      setNotice(error.response?.data?.message || 'Blocage impossible.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Chargement du tableau de bord…</p>
      </div>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-hero">
        <div>
          <span className="badge">Tableau de bord</span>
          <h1>Bonjour {user?.fullName}</h1>
          <p>
            Bienvenue sur votre espace personnel. Gérez vos publications, votre réseau et votre
            flux d’actualités depuis un seul endroit.
          </p>
        </div>
        <div className="hero-profile-card">
          <p>
            <strong>@{user?.username}</strong>
          </p>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </header>

      <section className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      {notice ? <p className="helper-message notice-message">{notice}</p> : null}

      <section className="dashboard-grid">
        <div className="stack-layout">
          <ArticleForm
            initialValues={editingArticle}
            onSubmit={handleArticleSubmit}
            onCancel={() => setEditingArticle(null)}
            submitting={savingArticle}
          />

          <ArticleList
            title="Mes articles"
            description="Retrouvez ici tous vos articles, publics et privés."
            articles={articles}
            emptyMessage="Vous n’avez publié aucun article pour le moment."
            onEdit={setEditingArticle}
            onDelete={handleDeleteArticle}
            onCommentAdded={handleCommentAdded}
          />
        </div>

        <div className="stack-layout">
          <ArticleList
            title="Flux des publications"
            description="Vos articles et les articles publics de vos amis s’affichent ici."
            articles={feed}
            emptyMessage="Aucun article visible dans votre flux pour le moment."
            showAuthor
            onCommentAdded={handleCommentAdded}
          />
        </div>
      </section>

      <section className="network-grid">
        <AjoutAmis onRefresh={loadDashboard} />
        <ListAmis
          friends={friends}
          incomingRequests={incomingRequests}
          outgoingRequests={outgoingRequests}
          onAccept={handleAccept}
          onRemove={handleRemove}
          onBlock={handleBlock}
        />
      </section>
    </main>
  );
}

export default Dashboard;
