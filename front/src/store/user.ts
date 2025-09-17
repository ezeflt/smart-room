import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AlarmStatus = { status: 'on' | 'off', id: string, name?: string };
export type AlarmStatusTuple = [AlarmStatus, AlarmStatus, AlarmStatus];

export interface UserState {
    alarmStatus: AlarmStatusTuple|any[];
    email: string;
    token: string | null;
    isAuthenticated: boolean;
    tokenExpiry: number | null;
    roomsIdAccess: string[];
    isInitialized: boolean;
}

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_TOKEN_EXPIRY_KEY = 'authTokenExpiry';

// Helper functions for localStorage operations
export const setUserToLocalStorage = (token: string | null, tokenExpiry: number | null) => {
    if (typeof window !== 'undefined') {
        if (token && tokenExpiry && Date.now() < tokenExpiry) {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            localStorage.setItem(AUTH_TOKEN_EXPIRY_KEY, String(tokenExpiry));
        } else {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY);
        }
    }
};

export const initUser = (): { token: string | null; tokenExpiry: number | null; isAuthenticated: boolean } => {
    if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        const storedExpiryStr = localStorage.getItem(AUTH_TOKEN_EXPIRY_KEY);
        const storedExpiry = storedExpiryStr ? Number(storedExpiryStr) : null;
        const now = Date.now();

        if (storedToken && storedExpiry && now < storedExpiry) {
            return { token: storedToken, tokenExpiry: storedExpiry, isAuthenticated: true };
        } else {
            // Cleanup if expired or inconsistent
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY);
        }
    }
    return { token: null, tokenExpiry: null, isAuthenticated: false };
};

let initialToken: string | null = null;
let initialExpiry: number | null = null;
let initialIsAuthenticated: boolean = false;

if (typeof window !== 'undefined') {
    const { token, tokenExpiry, isAuthenticated } = initUser();
    initialToken = token;
    initialExpiry = tokenExpiry;
    initialIsAuthenticated = isAuthenticated;
}

const initialState: UserState = {
    alarmStatus: [],
    email: '',
    token: initialToken,
    isAuthenticated: initialIsAuthenticated,
    tokenExpiry: initialExpiry,
    roomsIdAccess: [],
    isInitialized: false,
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
            // Update localStorage when token changes
            if (action.payload && state.tokenExpiry) {
                setUserToLocalStorage(action.payload, state.tokenExpiry);
            } else {
                setUserToLocalStorage(null, null);
            }
            return state;
        },
        setTokenExpiry: (state: UserState, action: PayloadAction<number | null>) => {
            state.tokenExpiry = action.payload;
            // Update localStorage when expiry changes
            if (state.token && action.payload) {
                setUserToLocalStorage(state.token, action.payload);
            }
            return state;
        },
        setRoomsIdAccess: (state: UserState, action: PayloadAction<string[]>) => {
            state.roomsIdAccess = action.payload;
            return state;
        },
        initTokenFromLocalStorage: (state: UserState) => {
            const { token, tokenExpiry, isAuthenticated } = initUser();
            state.token = token;
            state.tokenExpiry = tokenExpiry;
            state.isAuthenticated = isAuthenticated;
            state.isInitialized = true;
            return state;
        },
        logout: (state: UserState) => {
            state.token = null;
            state.isAuthenticated = false;
            state.tokenExpiry = null;
            state.roomsIdAccess = [];
            state.isInitialized = true; // Garder true car on a vérifié l'état
            // Clean up localStorage
            setUserToLocalStorage(null, null);
            return state;
        },
    },
});

export const { setEmail, setAlarmStatus, setToken, setTokenExpiry, setRoomsIdAccess, initTokenFromLocalStorage, logout } = userSlice.actions;

// Utility function to get auth token for API calls
export const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    return null;
};

export default userSlice.reducer;
