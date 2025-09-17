import { createSlice } from '@reduxjs/toolkit';

export interface Room {
    _id: string;
    name: string;
}

export interface GlobalState {
    selectedRoom: string | null;
    rooms: Room[];
}

const initialState: GlobalState = {
    selectedRoom: null,
    rooms: [],
};

const globalSlice = createSlice({
    name: 'global',
    initialState,
    reducers: {
        setSelectedRoom(state, action) {
            state.selectedRoom = action.payload;
        },
        setRooms(state, action) {
            state.rooms = action.payload;
            
            // Select first room if no room is selected
            if (action.payload.length > 0 && !state.selectedRoom) {
                state.selectedRoom = action.payload[0]._id;
            }
        },
    },
});

export const { setSelectedRoom, setRooms } = globalSlice.actions;
export default globalSlice.reducer;
