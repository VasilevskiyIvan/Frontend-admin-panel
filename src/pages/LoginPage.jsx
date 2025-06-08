import { useState } from 'react';
import { useAuth } from '../components/Auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const success = await login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Неверные учетные данные');
    }
  };

  return (
    <div className="page">
      <div className="left-design-element" />
      <div className="login-page">
        <Header title="Аутентификация" />
        <div className="login-container">
          <form onSubmit={handleSubmit} className="login-form">
            <h2>Вход в систему</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label htmlFor="username" className="login-page-label">Логин:</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="login-page-label">Пароль:</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">
              Войти
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;