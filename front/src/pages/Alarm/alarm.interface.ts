export interface AlarmProps {
    room: number;
    action: 'on' | 'off';
    timestamp: Date;
    userName: string;
}

export interface AlarmHistory {
    status: 'on' | 'off';
    timestamp: Date;
}
