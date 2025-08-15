export interface AlarmProps {
    room: number;
    action: 'on' | 'off';
    timestamp: Date;
    userName: string;
}