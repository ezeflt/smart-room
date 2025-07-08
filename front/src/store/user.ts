import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
    listId: {
        id1: string;
        id2: string;
        id3: string;
    };
    email: string;
}

const initialState: UserState = {
    listId: {
        id1: '',
        id2: '',
        id3: '',
    },
    email: 'test_email@gmail.com',
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state: UserState, action: PayloadAction<{ user: UserState }>) => {
            state = action.payload.user;
            return state;
        },
    },
});

export const { setUser } = userSlice.actions;

export default userSlice.reducer;
