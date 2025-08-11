import { createSlice } from '@reduxjs/toolkit';

export interface GlobalState {
    selectedRoom: number;
}

const initialState: GlobalState = {
    selectedRoom: 1,
};

const globalSlice = createSlice({
    name: 'global',
    initialState,
    reducers: {
        setSelectedRoom(state, action) {
            state.selectedRoom = action.payload;
        },
    },
});

export const { setAlarm, setSelectedRoom } = globalSlice.actions;
export default globalSlice.reducer;
