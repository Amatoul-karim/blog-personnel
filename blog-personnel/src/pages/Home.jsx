import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Authentification sécurisée',
    text: 'Inscription et connexion avec nom complet, nom d’utilisateur et mot de passe.'
  },
  {
    title: 'Gestion complète des articles',
    text: 'Créer, modifier, supprimer et choisir la visibilité publique ou privée.'
  },
  {
    title: 'Réseau social intégré',
    text: 'Rechercher des utilisateurs, envoyer des demandes, accepter, supprimer ou bloquer.'
  }
];

function Home() {
  return (
    <main className="landing-page">
      <section className="hero-card">
        <span className="badge">Projet React • Blog Personnel</span>
        <h1>Créez, partagez et gérez votre univers personnel</h1>
        <p className="hero-text">
          Une application de blog moderne avec tableau de bord, flux d’articles, gestion des amis
          et publication d’articles publics ou privés.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/register">
            Commencer
          </Link>
          <Link className="btn btn-secondary" to="/login">
            Se connecter
          </Link>
        </div>
      </section>

      <section className="feature-grid">
        {features.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <h2>{feature.title}</h2>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default Home;
