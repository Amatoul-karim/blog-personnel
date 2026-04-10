import LoginForm from '../components/auth/Login';

function Login() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Connexion</h1>
        <p>Accédez à votre tableau de bord pour publier et gérer votre réseau.</p>
        <LoginForm />
      </div>
    </main>
  );
}

export default Login;
