import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GlobalState {
}

const initialState: GlobalState = {
};

export const userSlice = createSlice({
    name: 'global',
    initialState,
    reducers: {
    },
});

export const { } = userSlice.actions;

export default userSlice.reducer;
