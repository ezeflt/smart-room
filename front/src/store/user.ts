import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AlarmStatus = { status: 'on' | 'off', id: string };
export type AlarmStatusTuple = [AlarmStatus, AlarmStatus, AlarmStatus];

export interface UserState {
    alarmStatus: AlarmStatusTuple;
    email: string;
    token: string | null;
    isAuthenticated: boolean;
    tokenExpiry: number | null;
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
    email: 'test_email@gmail.com',
    token: initialToken,
    isAuthenticated: Boolean(initialToken),
    tokenExpiry: initialExpiry,
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
        logout: (state: UserState) => {
            state.token = null;
            state.isAuthenticated = false;
            state.tokenExpiry = null;
            return state;
        },
    },
});

export const { setEmail, setAlarmStatus, setToken, setTokenExpiry, logout } = userSlice.actions;

export default userSlice.reducer;
