import React, { useState } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken, setTokenExpiry, setRoomsIdAccess } from '../../store/user';
import { login } from '../../protocol/api';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleLogin = async () => {
        try {
            setError('');

            if (username === '' || password === '') {
                setError('Please enter a username and password');
                return;
            }
            if (!username.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
                setError('Please enter a valid email');
                return;
            }
            const res = await login(username, password);
            if (res.type === 'danger') {
                setError(res.message);
                return;
            }
            console.log(res);
            
            dispatch(setToken(res.token));
            dispatch(setTokenExpiry(res.expiry));
            dispatch(setRoomsIdAccess(res.user.roomIds));
            localStorage.setItem('roomsIdAccess', JSON.stringify(res.user.roomIds));
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
