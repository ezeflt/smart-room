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


export type RootState = ReturnType<typeof store.getState>;
