import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { loginUser } from '../../services/api';

function LoginForm() {
  const navigate = useNavigate();
  const { authenticate } = useUser();
  const [formData, setFormData] = useState({ username: '', password: '' });
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
      const data = await loginUser(formData);
      authenticate(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label>
        Nom d’utilisateur
        <input
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="ex: marie.dev"
          required
        />
      </label>

      <label>
        Mot de passe
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Connexion en cours…' : 'Se connecter'}
      </button>

      <p className="form-footer">
        Pas encore de compte ? <Link to="/register">Créer un compte</Link>
      </p>
    </form>
  );
}

export default LoginForm;
