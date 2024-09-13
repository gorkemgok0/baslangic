import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, database } from './firebase'; // Import your Firebase configuration
import { ref, set } from 'firebase/database'; // Import Firebase Realtime Database functions
import './Register.css'; // Importing a separate CSS file for styling

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState(''); // Required field
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create a new user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the profile with the nickname
      await updateProfile(user, { displayName: nickname });

      // Save additional user information to the database
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        email: user.email,
        nickname: nickname,
      });

      navigate('/'); // Redirect to the Login page on successful registration
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Kayıt ol</h2>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="nickname">Adınız:</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
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
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <p className="login-link">
            Hesabın var mı? <a href="/">Giriş yap</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
