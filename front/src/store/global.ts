import { createSlice } from '@reduxjs/toolkit';

export interface GlobalState {
    isActivated: boolean;
    selectedRoom: number;
}

const initialState: GlobalState = {
    isActivated: false,
    selectedRoom: 1,
};

const globalSlice = createSlice({
    name: 'global',
    initialState,
    reducers: {
        setAlarm(state, action) {
            state.isActivated = action.payload.isActivated;
        },
        setSelectedRoom(state, action) {
            state.selectedRoom = action.payload;
        },
    },
});

export const { setAlarm, setSelectedRoom } = globalSlice.actions;
export default globalSlice.reducer;
