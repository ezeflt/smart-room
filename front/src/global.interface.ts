export enum Page {
    Weather = 'weather',
    Alarm = 'alarm',
}

export interface LargeScreenProps {
    page: Page;
    degreeCelcius?: number;
    handleClickToScreen?: () => void;
    handleRoomSelect?: (roomId: string) => void;
}