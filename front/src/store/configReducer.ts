import { configureStore } from '@reduxjs/toolkit';
import userReducer from './user';
import globalReducer from './global';

export const store = configureStore({
    reducer: {
        global: globalReducer,
        user: userReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_TOKEN_EXPIRY_KEY = 'authTokenExpiry';

// Persist token and expiry to localStorage on changes
if (typeof window !== 'undefined') {
    store.subscribe(() => {
        const { token, tokenExpiry } = store.getState().user;
        if (token && tokenExpiry && Date.now() < tokenExpiry) {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            localStorage.setItem(AUTH_TOKEN_EXPIRY_KEY, String(tokenExpiry));
        } else {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY);
        }
    });
}

export type RootState = ReturnType<typeof store.getState>;
