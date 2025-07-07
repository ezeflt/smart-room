import {store} from './configReducer';

export type State = ReturnType<typeof store.getState>;

export const userSelector = (state: State) => state.user;

export const globalSelector = (state: State) => state.global;