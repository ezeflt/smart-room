import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type AlarmStatus = { status: 'on' | 'off', id: string };
type AlarmStatusTuple = [AlarmStatus, AlarmStatus, AlarmStatus];

export interface UserState {
    alarmStatus: AlarmStatusTuple;
    email: string;
}

const initialState: UserState = {
    alarmStatus: [{ status: 'off', id: '1' }, { status: 'off', id: '2' }, { status: 'off', id: '3' }],
    email: 'test_email@gmail.com',
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setEmail: (state: UserState, action: PayloadAction<{ email: string }>) => {
            state.email = action.payload.email;
            return state;
        },
        setAlarmStatus: (state: UserState, action: PayloadAction<{ alarmStatus: AlarmStatusTuple }>) => {
            state.alarmStatus = action.payload.alarmStatus;
            return state;
        },
    },
});

export const { setEmail } = userSlice.actions;

export default userSlice.reducer;
