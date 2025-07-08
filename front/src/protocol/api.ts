import axios from 'axios';
import { AlarmHistoryResponse, AlarmResponse, WeatherHistoryResponse } from './api.interface';
import { UserState } from '../store/user';
import { config } from '../../../config';

const api = axios.create({
    baseURL: `http://${config.dns}:${config.port}`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getListIdQuery = (sensorList: UserState['listId']): string => {
    return `id1=${sensorList.id1}&id2=${sensorList.id2}&id3=${sensorList.id3}`;
}

// GET
export const getAlarmHistory = async (sensorList: UserState['listId']) => {
    const res = await api.get<AlarmHistoryResponse[]>(`alarm/history?${getListIdQuery(sensorList)}`);
    return res.data;
};

export const getWeatherHistory = async (sensorList: UserState['listId']) => {
    const res = await api.get<WeatherHistoryResponse>(`weather?${getListIdQuery(sensorList)}`);
    return res.data;
};

// PUT
export const putAlarm = async ({ sensorList, enabled }: { sensorList: UserState['listId']; enabled: boolean }) => {
    const res = await api.post<AlarmResponse>(`alarm?${getListIdQuery(sensorList)}`, { enabled });
    return res.data;
};
