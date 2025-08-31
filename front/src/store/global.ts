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
            // Si c'est la première fois qu'on charge les rooms et qu'aucune n'est sélectionnée, sélectionner la première
            if (state.rooms.length > 0 && !state.selectedRoom) {
                state.selectedRoom = state.rooms[0]._id;
            }
        },
    },
});

export const { setSelectedRoom, setRooms } = globalSlice.actions;
export default globalSlice.reducer;
