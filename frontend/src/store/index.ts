// src/store/index.ts
import { configureStore as reduxConfigureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import battleReducer from './slices/battleSlice';
import characterReducer from './slices/characterSlice';

export const configureStore = () => {
  return reduxConfigureStore({
    reducer: {
      auth: authReducer,
      battle: battleReducer,
      character: characterReducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Игнорируем некоторые неделимые действия/состояния
          ignoredActions: ['battle/updateBattle', 'battle/endBattle'],
          ignoredPaths: ['battle.currentBattle.startTime', 'battle.currentBattle.lastActionTime']
        }
      })
  });
};

export type RootState = ReturnType<ReturnType<typeof configureStore>['getState']>;
export type AppDispatch = ReturnType<typeof configureStore>['dispatch'];