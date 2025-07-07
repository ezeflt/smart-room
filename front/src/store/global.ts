import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GlobalState {
    alarm: {
        isActivated: boolean;
    };
}

const initialState: GlobalState = {
    alarm: {
        isActivated: false,
    },
};

export const userSlice = createSlice({
    name: 'global',
    initialState,
    reducers: {
        setAlarm: (state: GlobalState, action: PayloadAction<GlobalState['alarm']>) => {
            state.alarm = action.payload;
            return state;
        },
    },
});

export const { setAlarm } = userSlice.actions;

export default userSlice.reducer;
