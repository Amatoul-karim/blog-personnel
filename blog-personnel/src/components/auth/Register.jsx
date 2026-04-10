import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { registerUser } from '../../services/api';

function RegisterForm() {
  const navigate = useNavigate();
  const { authenticate } = useUser();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await registerUser(formData);
      authenticate(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Inscription impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label>
        Nom complet
        <input
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Marie Dupont"
          required
        />
      </label>

      <label>
        Nom d’utilisateur
        <input
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="marie.dev"
          required
        />
      </label>

      <label>
        Mot de passe
        <input
          name="password"
          type="password"
          minLength={6}
          value={formData.password}
          onChange={handleChange}
          placeholder="6 caractères minimum"
          required
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Création du compte…' : 'Créer mon compte'}
      </button>

      <p className="form-footer">
        Déjà inscrit ? <Link to="/login">Se connecter</Link>
      </p>
    </form>
  );
}

export default RegisterForm;
