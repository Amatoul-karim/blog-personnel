import RegisterForm from '../components/auth/Register';

function Register() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Inscription</h1>
        <p>Créez votre compte pour publier vos premiers articles.</p>
        <RegisterForm />
      </div>
    </main>
  );
}

export default Register;
