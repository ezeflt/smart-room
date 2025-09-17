import React, { useState } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken, setTokenExpiry, setRoomsIdAccess } from '../../store/user';
import { login, setApiToken } from '../../protocol/api';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    
    const handleLogin = async () => {
        try {
            setError('');

            // Verification si le username et le password sont remplis
            if (username === '' || password === '') {
                setError('Please enter a username and password');
                return;
            }

            // Verification si le username est un email valide
            if (!username.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
                setError('Please enter a valid email');
                return;
            }

            // Connexion
            const res = await login(username, password);

            if (res.type === 'danger') {
                setError(res.message);
                return;
            }
            
            // Calculer l'expiration du token basée sur expiresIn (en millisecondes)
            const expiresIn24Hours = Date.now() + res.expiresIn;

            console.log('expiresIn24Hours', expiresIn24Hours);
            
            dispatch(setToken(res.token));
            dispatch(setTokenExpiry(expiresIn24Hours));
            dispatch(setRoomsIdAccess(res.user.roomIds || []));

            setApiToken(res.token);
            
            // Naviguer vers la page d'alarme après connexion réussie
            navigate('/alarm');

        } catch (error) {
            setError('Une erreur est survenue lors de la connexion');
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
