export interface AlarmProps {
    room: number;
    timestamp: Date;
}

export interface AlarmHistory {
    status: 'on' | 'off';
    timestamp: Date;
}
