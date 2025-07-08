import { WeatherProps } from "../pages/Weather/weather.interface";
import { AlarmHistory, AlarmProps } from "../pages/Alarm/alarm.interface";

export type AlarmResponse = AlarmProps;
export type AlarmHistoryResponse = AlarmHistory[];

export type WeatherResponse = WeatherProps;
export type WeatherHistoryResponse = WeatherProps[];