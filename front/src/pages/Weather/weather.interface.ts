export interface WeatherProps {
    temperature: number;
    humidity: number;
    pressure: number;
    sensor_id: number | string;
    timestamp: string | Date;
}
