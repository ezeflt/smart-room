import React, { useState } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken, setTokenExpiry } from '../../store/user';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleLogin = () => {

        if (username === '' || password === '') {
            console.error('Please enter a username and password');
            setError('Please enter a username and password');
            return;
        }

        if (!username.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            console.error('Please enter a valid email');
            setError('Please enter a valid email');
            return;
        }
        
        // Simulate receiving a token from API and store it
        const fakeToken = `token-${Date.now()}`;
        const twoHoursMs = 2 * 60 * 60 * 1000;
        const expiry = Date.now() + twoHoursMs;
        dispatch(setToken(fakeToken));
        dispatch(setTokenExpiry(expiry));

        setError('');
        navigate('/alarm');
    };

    return (
        <div className="container-wrapper">
            <div className="login-container">
                <h2>Connexion</h2>
                <input type="text" placeholder="Nom d'utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button onClick={handleLogin}>Se connecter</button>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default Login;
