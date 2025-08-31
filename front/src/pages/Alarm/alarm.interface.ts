export interface AlarmProps {
    room: number;
    action: 'active' | 'desactive';
    timestamp: Date;
    userName: string;
}