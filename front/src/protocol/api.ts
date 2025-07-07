import axios from 'axios';
import { AlarmResponse, WeatherResponse } from './api.interface';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const putAlarm = async ({ userId, enabled }: { userId: string; enabled: boolean }) => {
    const res = await api.post<AlarmResponse>(`alarm/${userId}`, { enabled });
    return res.data;
};

export const getAlarm = async (userId: string) => {
    const res = await api.get<AlarmResponse>(`alarm/${userId}`);
    return res.data;
};

export const getWeather = async (userId: string) => {
    const res = await api.get<WeatherResponse>(`weather/${userId}`);
    return res.data;
};
