import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase'; // Firebase configuration
import './Login.css'; // Importing a separate CSS file for styling

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if email and password are stored in localStorage when the component mounts
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        // Store email and password in localStorage
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', password); // Storing password is NOT recommended in plain text
      } else {
        // Remove email and password if 'Remember Me' is not checked
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Giriş Yap</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">E-mail:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Şifre:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group remember-me">
  <input
    type="checkbox"
    id="rememberMe"
    checked={rememberMe}
    onChange={() => setRememberMe(!rememberMe)}
  />
  <label htmlFor="rememberMe">Beni hatırla</label>
</div>
  
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Oturum Açılıyor...' : 'Oturum aç'}
          </button>
          <p className="register-link">
            Hesabın yok mu? <a href="/register">Kayıt ol</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
