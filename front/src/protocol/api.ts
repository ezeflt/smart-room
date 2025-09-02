import axios from 'axios';
import { AlarmResponse } from './api.interface';
import { getAuthToken } from '../store/user';
const SERVER_URL = import.meta.env.VITE_API as string;

const api = axios.create({
    baseURL: SERVER_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to automatically add Bearer token
api.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const setApiToken = async (token: string) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const getRooms = async () => {
    const res = await api.get('rooms');
    return res.data;
};

// PUT
export const putAlarm = async ({ enabled, room_id }: { enabled: boolean, room_id: string }) => {
    const token = localStorage.getItem('token');
    const res = await api.put<AlarmResponse>(`alarm/${enabled ? 'activate' : 'deactivate'}?room_id=${room_id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return res.data;
};

export const login = async (mail: string, password: string) => {
    const res = await api.post('login', { mail, password });
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

export const getMe = async () => {
    const res = await api.get('/user/me');
    return res.data;
};