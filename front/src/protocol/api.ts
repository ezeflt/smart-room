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
export const checkAdminStatus = async () => {
    const res = await api.get('/user/me');
    // Le backend renvoie { user: { role: "admin" } }, on extrait le rôle
    return { role: res.data.user.role };
};
