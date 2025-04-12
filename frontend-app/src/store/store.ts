import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistConfig } from 'redux-persist/es/types';

interface AuthState {
    token: string | null;
    isAdmin: boolean;
}

const initialState: AuthState = {
    token: null,
    isAdmin: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<{ token: string; isAdmin: boolean }>) => {
            state.token = action.payload.token;
            state.isAdmin = action.payload.isAdmin;
        },
        logout: (state) => {
            state.token = null;
            state.isAdmin = false;
        },
    },
});

export const { login, logout } = authSlice.actions;

const persistConfig: PersistConfig<AuthState> = {
    key: 'auth',
    storage,
};

const persistedReducer = persistReducer(persistConfig, authSlice.reducer);

export const store = configureStore({
    reducer: {
        auth: persistedReducer,
    },
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;