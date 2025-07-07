import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
    _id: string;
    email: string;
}

const initialState: UserState = {
    _id: 'user_id',
    email: 'test_email@gmail.com',
};

export const userSlice = createSlice({
    name: "user",
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
