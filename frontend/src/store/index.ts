// src/store/index.ts
import { configureStore as reduxConfigureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import battleReducer from './slices/battleSlice';

export const configureStore = () => {
  return reduxConfigureStore({
    reducer: {
      auth: authReducer,
      battle: battleReducer,
      // Добавьте здесь другие редюсеры по мере необходимости
      character: (state = { current: null, skills: [], inventory: [] }, action) => {
        // Временный пустой редюсер, пока не будет создан полноценный слайс для персонажей
        return state;
      }
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