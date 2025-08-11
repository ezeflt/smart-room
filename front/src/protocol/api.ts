import axios from 'axios';
import { AlarmResponse } from './api.interface';
import { config } from '../../config';

const api = axios.create({
    baseURL: `https://${config.dns}`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
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
