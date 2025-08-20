import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AlarmStatus = { status: 'on' | 'off', id: string };
export type AlarmStatusTuple = [AlarmStatus, AlarmStatus, AlarmStatus];

export interface UserState {
    alarmStatus: AlarmStatusTuple;
    email: string;
    token: string | null;
    isAuthenticated: boolean;
    tokenExpiry: number | null;
    roomsIdAccess: string[];
}

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_TOKEN_EXPIRY_KEY = 'authTokenExpiry';

let initialToken: string | null = null;
let initialExpiry: number | null = null;
if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedExpiryStr = localStorage.getItem(AUTH_TOKEN_EXPIRY_KEY);
    const storedExpiry = storedExpiryStr ? Number(storedExpiryStr) : null;
    const now = Date.now();

    if (storedToken && storedExpiry && now < storedExpiry) {
        initialToken = storedToken;
        initialExpiry = storedExpiry;
    } else {
        // Cleanup if expired or inconsistent
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY);
        initialToken = null;
        initialExpiry = null;
    }
}

const initialState: UserState = {
    alarmStatus: [{ status: 'off', id: '1' }, { status: 'off', id: '2' }, { status: 'off', id: '3' }],
    email: 'ezechiel@gmail.com',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGEzODY4NDg3OTE0NmNkMmE1MmM4NjQiLCJtYWlsIjoiZXplY2hpZWxAZ21haWwuY29tIiwiaWF0IjoxNzU1NTQ4MDQzLCJleHAiOjE3NTU2MzQ0NDN9.Q4q6WPvE6-4i5CUxBlCu-AAC4QHaVgT5tKeadaE5EWY',
    isAuthenticated: true,
    tokenExpiry: initialExpiry,
    roomsIdAccess: [],
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
        setToken: (state: UserState, action: PayloadAction<string | null>) => {
            state.token = action.payload;
            state.isAuthenticated = Boolean(action.payload);
            return state;
        },
        setTokenExpiry: (state: UserState, action: PayloadAction<number | null>) => {
            state.tokenExpiry = action.payload;
            return state;
        },
        setRoomsIdAccess: (state: UserState, action: PayloadAction<string[]>) => {
            state.roomsIdAccess = action.payload;
            return state;
        },
        logout: (state: UserState) => {
            state.token = null;
            state.isAuthenticated = false;
            state.tokenExpiry = null;
            state.roomsIdAccess = [];
            return state;
        },
    },
});

export const { setEmail, setAlarmStatus, setToken, setTokenExpiry, setRoomsIdAccess, logout } = userSlice.actions;

export default userSlice.reducer;
