import React, { useState } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken, setTokenExpiry } from '../../store/user';
import { config } from '../../../config';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleLogin = async () => {
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

        try {
            // Appel à l'API de login du backend
            const response = await fetch(`http://${config.dns}:${config.port}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mail: username, // Le backend attend 'mail'
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Login réussi, récupérer le token JWT
                const { token, expiresIn } = data;
                
                // Stocker le token et calculer l'expiration
                const expiry = Date.now() + (expiresIn || (2 * 60 * 60 * 1000)); // 2h par défaut
                
                dispatch(setToken(token));
                dispatch(setTokenExpiry(expiry));

                setError('');
                navigate('/alarm');
            } else {
                // Erreur de login
                setError(data.message || 'Erreur de connexion');
            }
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            setError('Erreur de connexion au serveur');
        }
    };

    return (
        <div className="container-wrapper">
            <div className="login-container">
                <h2>Connexion</h2>
                <input type="text" placeholder="Email" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button onClick={handleLogin}>Se connecter</button>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default Login;
