import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '../store/store';
import { login } from '../utils/api';
import './../styles/Login.css'; // Import custom CSS for styling

interface LoginProps {
  onLogin: (isAdmin: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await login(email, password);
    if (response) {
      dispatch(loginAction({ token: response.token, isAdmin: response.isAdmin }));
      onLogin(response.isAdmin); // Pass the isAdmin flag to the parent
    } else {
      alert('Login failed!');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Use the SVG logo */}
          <img src="/logo.svg" alt="App Logo" className="login-logo" />
          <h2 className="login-title">Smart Donation Platform</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;