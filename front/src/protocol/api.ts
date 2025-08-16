import axios from 'axios';
import { AlarmResponse } from './api.interface';
import { config } from '../../config';

const api = axios.create({
    baseURL: `http://${config.dns}:${config.port}`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers = config.headers ?? {};
            (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
    }
    return config;
});

// PUT
export const putAlarm = async ({ enabled, room_id }: { enabled: boolean, room_id: number }) => {
    const token = localStorage.getItem('token');
    const res = await api.post<AlarmResponse>(`alarm/${enabled ? 'activate' : 'deactivate'}?room_id=${room_id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return res.data;
};

export const updateUser = async (userId: string, userData: { username?: string; mail?: string; password?: string }) => {
    const token = localStorage.getItem('token');
    const res = await api.put(`user/${userId}`, userData, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return res.data;
};

export const deleteUser = async (userId: string) => {
    const token = localStorage.getItem('token');
    const res = await api.delete(`user/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return res.data;
};

export const createUser = async (userData: { username: string; mail: string; password: string; role: string }) => {
    const res = await api.post('register', userData);
    return res.data;
};

// Vérifier si l'utilisateur connecté est admin
// Note: Cette fonction nécessite un endpoint backend /user/me qui n'existe pas encore
// En attendant, on simule la vérification avec le token stocké
export const checkAdminStatus = async () => {
    try {
        // Essayer d'appeler l'endpoint backend s'il existe
        const res = await api.get('/user/me');
        return res.data;
    } catch (error) {
        // Si l'endpoint n'existe pas, on simule une réponse admin pour les tests
        // TODO: Implémenter l'endpoint /user/me sur le backend
        console.warn('Endpoint /user/me non disponible, simulation de la vérification admin');
        
        // Pour les tests, on considère que l'utilisateur est admin s'il a un token
        const token = localStorage.getItem('authToken');
        if (token) {
            // Simulation: on renvoie un rôle admin temporaire
            return { role: 'admin' };
        } else {
            throw new Error('No token found');
        }
    }
};
