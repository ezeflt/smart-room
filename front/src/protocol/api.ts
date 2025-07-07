import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getAlarm = async (userId: string) => {
    const res = await api.get(`alarm/${userId}`);
    return res.data;
};

export const getWeather = async (userId: string) => {
    const res = await api.get(`weather/${userId}`);
    return res.data;
};

